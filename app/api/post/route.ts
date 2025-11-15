import { NextResponse, type NextRequest } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
}

async function getUserFromToken(request: NextRequest): Promise<JwtPayload | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
        return null;
    }
}

// Helper de Upload 
async function saveMedia(media: File): Promise<{ publicUrl: string, mediaType: string }> {
    const bytes = await media.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${media.name.replace(/\s/g, '_')}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadsDir, filename);
    const publicUrl = `/uploads/${filename}`;
    const mediaType = media.type;

    try {
        await writeFile(filepath, buffer);
    } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            try {
                const fs = require('fs/promises');
                await fs.mkdir(uploadsDir, { recursive: true });
                await writeFile(filepath, buffer);
            } catch (mkdirError) {
                console.error('Erro ao criar diretório ou salvar:', mkdirError);
                throw new Error('Falha ao salvar mídia.');
            }
        } else {
           throw error;
        }
    }
    return { publicUrl, mediaType };
}

// Criar um novo Post
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
        }

        await connectMongo();

        const formData = await request.formData();
        const description = formData.get('description') as string | null;

        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ message: 'Nenhum arquivo enviado.' }, { status: 400 });
        }

        const savePromises = files.map(file => saveMedia(file));
        const savedMediaItems = await Promise.all(savePromises);
        
        const newPost = new Post({
            media: savedMediaItems.map(item => ({
                url: item.publicUrl,
                type: item.publicUrl.endsWith('.mp4') ? 'video/mp4' : 'image/png'
            })),
            
            description: description || '',
            authorId: user.id,
        });

        await newPost.save();

        return NextResponse.json({
            message: 'Post criado com sucesso!',
            post: newPost
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na rota API de post:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao criar post.', error: errorMessage }, { status: 500 });
    }
}