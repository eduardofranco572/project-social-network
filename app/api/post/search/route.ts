import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let query = searchParams.get('q');
        
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const skip = (page - 1) * limit;

        if (!query || query.trim().length === 0) {
            return NextResponse.json({ posts: [], hasMore: false }, { status: 200 });
        }

        await connectMongo();

        const translations: Record<string, string> = {
            'gato': 'cat', 
            'gatinho': 'cat', 
            'cachorro': 'dog', 
            'cao': 'dog',
            'cão': 'dog', 
            'carro': 'car', 
            'comida': 'food', 
            'pessoa': 'person',
            'homem': 'person', 
            'mulher': 'person', 
            'praia': 'beach',
            'computador': 'laptop', 
            'celular': 'cell phone'
        };

        const lowerQuery = query.toLowerCase();
        if (translations[lowerQuery]) {
            query = `${query} ${translations[lowerQuery]}`;
        }

        const [posts, totalPosts] = await Promise.all([
            Post.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } }
            )
            .sort({ score: { $meta: "textScore" } })
            .skip(skip)
            .limit(limit)
            .lean(),
            
            Post.countDocuments({ $text: { $search: query } })
        ]);

        if (!posts.length) {
            return NextResponse.json({ posts: [], hasMore: false }, { status: 200 });
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

        const formattedPosts = posts.map((p: any) => ({
            _id: p._id.toString(),
            media: p.media, 
            description: p.description,
            likes: (p.likes || []).map((id: any) => parseInt(id, 10)), 
            savedBy: (p.savedBy || []).map((id: any) => parseInt(id, 10)), 
            createdAt: p.createdAt,
            author: authorMap.get(p.authorId) || {
                id: p.authorId,
                nome: 'Usuário Desconhecido',
                fotoPerfil: '/img/iconePadrao.svg'
            }
        }));

        return NextResponse.json({
            posts: formattedPosts,
            hasMore: skip + posts.length < totalPosts
        }, { status: 200 });

    } catch (error) {
        console.error("Erro na busca de posts:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}