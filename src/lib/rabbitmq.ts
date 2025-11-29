import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URI;

if (!RABBITMQ_URL) {
  throw new Error('Por favor, defina a variável RABBITMQ_URI no .env');
}

export async function publishToQueue(queue: string, message: any) {
    let connection;
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createConfirmChannel();
        
        await channel.assertQueue(queue, { durable: true });
        
        await new Promise<void>((resolve, reject) => {
            const sent = channel.sendToQueue(
                queue, 
                Buffer.from(JSON.stringify(message)), 
                { persistent: true },
                (err) => {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
        
        console.log(`[RabbitMQ] Mensagem enviada e confirmada para ${queue}`);

    } catch (error) {
        console.error('[RabbitMQ] Erro ao publicar:', error);
        throw error; 
    } finally {
        if (connection) await connection.close();
    }
}