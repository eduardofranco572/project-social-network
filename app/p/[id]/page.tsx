import React from 'react';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import getSequelizeInstance from '@/src/database/database';
import { PostDetailModal } from '@/src/features/post/components/PostDetailModal';
import { redirect } from 'next/navigation';
import { PostWithAuthor } from '@/src/features/post/components/types';

async function getPostById(id: string): Promise<PostWithAuthor | null> {
    try {
        await connectMongo();
        const post = await Post.findById(id).lean();
        if (!post) return null;

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        const user = await Usuario.findOne({ where: { USU_ID: post.authorId } });

        return {
            ...post,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            author: {
                id: post.authorId,
                nome: user?.USU_NOME || 'Usuário',
                fotoPerfil: user?.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
            },

            media: post.media.map((m: any) => ({...m, _id: m._id.toString()}))

        } as any;

    } catch (error) {
        console.error(error);
        return null;
    }
}

export default async function PostPage({ params }: { params: { id: string } }) {
    const post = await getPostById(params.id);

    if (!post) {
        return <div className="text-white text-center pt-20">Post não encontrado.</div>;
    }
    
    return (
        <ClientPostPageWrapper post={post} />
    );
}

import ClientPostPageWrapper from './ClientWrapper';