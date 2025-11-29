import { Server } from 'socket.io';
import { createServer } from 'http';
import amqp from 'amqplib';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const PORT = 3001;
const RABBITMQ_URL = process.env.RABBITMQ_URI || 'amqp://localhost';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

async function startSocketServer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        const QUEUE_NAME = 'realtime_events';
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`[Socket Server] Conectado ao RabbitMQ. Aguardando eventos...`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg) {
                const content = JSON.parse(msg.content.toString());
                const { event, data, roomId } = content;

                console.log(`[Socket Server] Emitindo evento: ${event}`);

                if (roomId) {
                    io.to(roomId.toString()).emit(event, data);
                } else {
                    io.emit(event, data);
                }

                channel.ack(msg);
            }
        });

        io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);

            socket.on('join_room', (userId) => {
                if (userId) {
                    socket.join(userId.toString());
                    console.log(`Socket ${socket.id} entrou na sala ${userId}`);
                }
            });

            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
            });
        });

        httpServer.listen(PORT, () => {
            console.log(`[Socket Server] Rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error('[Socket Server] Erro ao conectar. Tentando novamente em 5s...', error);
        setTimeout(startSocketServer, 5000);
    }
}

startSocketServer();