import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';
import { likeService } from '../../services/likeService.ts'; 
import { followService } from '../../services/followService.ts';

// Configuração para o Worker
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URI!;
const QUEUE_NAME = 'user_interactions';

async function start() {
    try {
        console.log(`[Interaction Worker] Iniciando...`);

        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
    
        channel.prefetch(1);

        console.log(`[Interaction Worker] Aguardando eventos de Like/Follow...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());
                const { type } = content;

                if (type === 'LIKE') {
                    const { userId, postId, action } = content;
                    console.log(`[Interaction Worker] Processando LIKE: User ${userId} -> Post ${postId} (${action})`);
                    
                    await likeService.toggleLike(userId, postId, action);
                } 
                
                else if (type === 'FOLLOW') {
                    const { followerId, targetUserId } = content;
                    console.log(`[Interaction Worker] Processando FOLLOW: User ${followerId} -> User ${targetUserId}`);
                    
                    await followService.toggleFollow(followerId, targetUserId);
                }
                channel.ack(msg);

            } catch (error) {
                console.error(`[Interaction Worker] Erro ao processar mensagem:`, error);
                channel.ack(msg); 
            }
        });

    } catch (error) {
        console.error(`[Interaction Worker] Falha fatal na conexão:`, error);
        setTimeout(start, 5000);
    }
}

start();