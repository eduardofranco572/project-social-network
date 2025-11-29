import amqp from 'amqplib';
import mongoose from 'mongoose';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-cpu';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import fs from 'fs';
import jpeg from 'jpeg-js';
import { PNG } from 'pngjs';
import Post from '../../models/post.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const RABBITMQ_URL = process.env.RABBITMQ_URI!;
const MONGO_URI = process.env.MONGO_URI!;
const QUEUE_NAME = 'image_classification';

function imageToTensor(buffer: Buffer, mimeType: string): tf.Tensor3D {
    let values: Uint8Array | Buffer;
    let width: number;
    let height: number;

    if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
        const decoded = jpeg.decode(buffer, { useTArray: true });
        values = decoded.data;
        width = decoded.width;
        height = decoded.height;
    } else if (mimeType === 'image/png') {
        const decoded = PNG.sync.read(buffer);
        values = decoded.data;
        width = decoded.width;
        height = decoded.height;
    } else {
        throw new Error(`Formato não suportado: ${mimeType}`);
    }

    return tf.tidy(() => {
        const tensor = tf.tensor3d(values, [height, width, 4], 'int32');
        return tensor.slice([0, 0, 0], [height, width, 3]);
    });
}

async function start() {
    try {
        console.log(`[Worker] Iniciando IA...`);
        
        await tf.setBackend('cpu');
        
        if (!mongoose.connection.readyState) {
            await mongoose.connect(MONGO_URI);
        }

        const model = await cocoSsd.load();
        console.log(`[Worker] Modelo Carregado!`);

        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.prefetch(1);

        console.log(`[Worker] Aguardando imagens...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) return;

            try {
                const content = JSON.parse(msg.content.toString());
                const { postId, filePath, mimeType } = content;

                console.log(`[Worker] Processando: ${postId}`);

                if (fs.existsSync(filePath)) {
                    const imageBuffer = fs.readFileSync(filePath);
                    const imageTensor = imageToTensor(imageBuffer, mimeType);
                    
                    const predictions = await model.detect(imageTensor);
                    const tags = predictions.map(p => p.class.toLowerCase());
                    
                    imageTensor.dispose();

                    if (tags.length > 0) {
                        console.log(`[Worker] Tags: ${tags.join(', ')}`);
                        await Post.findByIdAndUpdate(postId, { 
                            $addToSet: { autoTags: { $each: tags } } 
                        });
                    }
                }

                channel.ack(msg);
            } catch (error) {
                console.error(`[Worker] Erro:`, error);
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error(`[Worker] Falha fatal:`, error);
    }
}

start();