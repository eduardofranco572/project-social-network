import { NextResponse, NextRequest } from 'next/server';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import Status from '@/src/models/status';
import bcrypt from 'bcryptjs';

import { saveFile } from '@/src/lib/uploadUtils';
import { publishToQueue } from '@/src/lib/rabbitmq';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id);
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const user = await Usuario.findOne({
            where: { USU_ID: userId },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL', 'USU_BANNER', 'USU_LOGIN']
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
            email: user.USU_LOGIN,
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
        const profileFile = formData.get('foto') as File | null;
        const nome = formData.get('nome') as string | null; 
        const novaSenha = formData.get('senha') as string | null;

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);

        const user = await Usuario.findByPk(userId);
        if (!user) return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });

        if (bannerFile) {
            const bannerUrl = await saveFile(bannerFile, 'profiles', userId);
            user.USU_BANNER = bannerUrl;
        }

        if (profileFile) {
            const fotoUrl = await saveFile(profileFile, 'profiles', userId);
            user.USU_FOTO_PERFIL = fotoUrl;
        }

        if (nome) user.USU_NOME = nome;

        if (novaSenha && novaSenha.trim().length > 0) {
            if (novaSenha.length < 6) {
                return NextResponse.json({ message: 'Senha muito curta' }, { status: 400 });
            }

            const hashedPassword = await bcrypt.hash(novaSenha, 10);
            user.USU_SENHA = hashedPassword;
        }

        await user.save();

        try {
            await publishToQueue('user_data_sync', {
                userId: user.USU_ID,
                nome: user.USU_NOME,
                foto: user.USU_FOTO_PERFIL
            });
        } catch (queueError) {
            console.error("Erro ao enviar para fila de sync:", queueError);
        }
        
        try {
            await publishToQueue('realtime_events', {
                event: 'user_updated',
                roomId: userId, 
                data: {
                    id: user.USU_ID,
                    nome: user.USU_NOME,
                    foto: user.USU_FOTO_PERFIL,
                    banner: user.USU_BANNER
                }
            });
        } catch (queueError) {
            console.error("Erro ao enviar para fila de sync:", queueError);
        }

        return NextResponse.json({ 
            message: 'Perfil atualizado com sucesso',
            user: {
                nome: user.USU_NOME,
                foto: user.USU_FOTO_PERFIL,
                banner: user.USU_BANNER
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar perfil:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}