import { NextResponse, NextRequest } from 'next/server';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import Status from '@/src/models/status';

import { saveFile } from '@/src/lib/uploadUtils';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id);
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const user = await Usuario.findOne({
            where: { USU_ID: userId },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL', 'USU_BANNER']
        });

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        await connectMongo();
        
        const postsCount = await Post.countDocuments({ authorId: userId });

        const statuses = await Status.find({ authorId: userId }).sort({ createdAt: 1 }).lean();
        
        let statusPayload = null;
        if (statuses.length > 0) {
            statusPayload = {
                author: {
                    id: user.USU_ID,
                    nome: user.USU_NOME,
                    fotoPerfil: user.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
                },
                statuses: statuses.map((s: any) => ({
                    _id: s._id.toString(),
                    mediaUrl: s.mediaUrl,
                    mediaType: s.mediaType,
                    description: s.description,
                    createdAt: s.createdAt
                }))
            };
        }

        return NextResponse.json({
            id: user.USU_ID,
            nome: user.USU_NOME,
            foto: user.USU_FOTO_PERFIL || '/img/iconePadrao.svg',
            banner: user.USU_BANNER,
            stats: { posts: postsCount, followers: 0, following: 0 },
            status: statusPayload 

        }, { status: 200 });
        
    } catch (error) {
        console.error("Erro na API de perfil:", error);
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id);
    
    try {
        const formData = await request.formData();
        const bannerFile = formData.get('banner') as File | null;

        if (!bannerFile) {
            return NextResponse.json({ message: 'Nenhuma imagem enviada' }, { status: 400 });
        }

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);

        const user = await Usuario.findByPk(userId);
        if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });

        const bannerUrl = await saveFile(bannerFile, 'profiles', userId);

        user.USU_BANNER = bannerUrl;
        await user.save();

        return NextResponse.json({ 
            message: 'Banner atualizado', 
            bannerUrl 
        }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar banner:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}