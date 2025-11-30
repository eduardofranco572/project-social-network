import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id);

    try {
        await connectMongo();

        const posts = await Post.find({ savedBy: userId })
            .sort({ createdAt: -1 })
            .lean();

        if (!posts || posts.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const authorIds = Array.from(new Set(posts.map((post: any) => post.authorId)));

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const authors = await Usuario.findAll({
            where: { USU_ID: authorIds },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL']
        });

        const authorMap = new Map(authors.map(author => [
            author.USU_ID, 
            {
                id: author.USU_ID,
                nome: author.USU_NOME,
                fotoPerfil: author.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
            }
        ]));

        const formattedPosts = posts.map((post: any) => ({
            _id: post._id.toString(),
            media: post.media,
            description: post.description,
            likes: (post.likes || []).map((id: any) => parseInt(id, 10)),
            savedBy: (post.savedBy || []).map((id: any) => parseInt(id, 10)),
            createdAt: post.createdAt,
            author: authorMap.get(post.authorId) || {
                id: post.authorId,
                nome: 'Usuário Desconhecido',
                fotoPerfil: '/img/iconePadrao.svg'
            }
        }));

        return NextResponse.json(formattedPosts, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar posts salvos:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}