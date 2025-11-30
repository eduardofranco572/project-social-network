import amqp from 'amqplib';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Post from '../../models/post.ts';
import Comment from '../../models/comment.ts';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URI!;
const MONGO_URI = process.env.MONGO_URI!;
const QUEUE_NAME = 'user_data_sync';

async function start() {
    try {
        console.log(`[Sync Worker] Iniciando Sincronização de Dados de Usuário...`);

        if (!mongoose.connection.readyState) {
            await mongoose.connect(MONGO_URI);
        }

        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);

        console.log(`[Sync Worker] Aguardando atualizações de perfil...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());
                const { userId, nome, foto } = content;

                console.log(`[Sync Worker] Atualizando documentos para User ID: ${userId}`);

                const updateData: any = {};
                if (nome) updateData.authorName = nome;
                if (foto) updateData.authorPhoto = foto;

                const commentUpdateData: any = {};
                if (nome) commentUpdateData.userName = nome;
                if (foto) commentUpdateData.userPhoto = foto;

                await Promise.all([
                    Post.updateMany({ authorId: userId }, { $set: updateData }),
                    Comment.updateMany({ userId: userId }, { $set: commentUpdateData })
                ]);

                console.log(`[Sync Worker] Sincronização concluída para User ID: ${userId}`);
                channel.ack(msg);

            } catch (error) {
                console.error(`[Sync Worker] Erro ao processar mensagem:`, error);
                channel.nack(msg, false, false); 
            }
        });

    } catch (error) {
        console.error(`[Sync Worker] Falha fatal:`, error);
        setTimeout(start, 5000);
    }
}

start();