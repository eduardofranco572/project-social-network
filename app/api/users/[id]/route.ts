import { NextResponse, NextRequest } from 'next/server';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id);
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const user = await Usuario.findOne({
            where: { USU_ID: userId },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL']
        });

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        await connectMongo();
        const postsCount = await Post.countDocuments({ authorId: userId });

        return NextResponse.json({
            id: user.USU_ID,
            nome: user.USU_NOME,
            foto: user.USU_FOTO_PERFIL || '/img/iconePadrao.svg',
            stats: { posts: postsCount, followers: 0, following: 0 }

        }, { status: 200 });
        
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}