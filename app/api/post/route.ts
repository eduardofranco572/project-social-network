import { NextResponse, type NextRequest } from 'next/server';
import { writeFile, unlink } from 'fs/promises'; 
import path from 'path';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

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
                type: item.mediaType 
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


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const userId = searchParams.get('userId');

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '15', 10);
        const offset = (page - 1) * limit;

        const query = userId ? { authorId: parseInt(userId) } : {};

        await connectMongo();

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean(); 

        const totalPosts = await Post.countDocuments(query);

        if (!posts.length) {
            return NextResponse.json({
                posts: [],
                page,
                hasMore: false,
            }, { status: 200 });
        }

        const authorIds = Array.from(new Set(posts.map(post => post.authorId)));

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const authors = await Usuario.findAll({
            where: {
                USU_ID: authorIds
            },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL']
        });

        const authorMap = new Map(authors.map(author => [
            author.USU_ID, 
            {
                id: author.USU_ID,
                nome: author.USU_NOME,
                fotoPerfil: author.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
            }
        ]));

        const populatedPosts = posts.map(post => ({
            ...post,
            _id: post._id.toString(),
            likes: (post.likes || []).map((id: any) => parseInt(id, 10)),
            author: authorMap.get(post.authorId) || {
                id: post.authorId,
                nome: 'Usuário Desconhecido',
                fotoPerfil: '/img/iconePadrao.svg'
            }
        }));

        return NextResponse.json({
            posts: populatedPosts,
            page: page,
            hasMore: (offset + posts.length) < totalPosts,
        }, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao buscar posts.', error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
        }

        const { postId } = await request.json();
        if (!postId) {
            return NextResponse.json({ message: 'ID do post é obrigatório.' }, { status: 400 });
        }

        await connectMongo();

        const post = await Post.findById(postId);

        if (!post) {
            return NextResponse.json({ message: 'Post não encontrado.' }, { status: 404 });
        }

        if (post.authorId !== user.id) {
            return NextResponse.json({ message: 'Você não tem permissão para excluir este post.' }, { status: 403 });
        }

        // Excluir os arquivos de mídia 
        for (const media of post.media) {
            try {
                const filePath = path.join(process.cwd(), 'public', media.url);
                await unlink(filePath);
            } catch (fileError) {
                console.warn(`Falha ao excluir arquivo: ${media.url}`, fileError);
            }
        }

        // Excluir o post do banco de dados
        await Post.findByIdAndDelete(postId);

        return NextResponse.json({ message: 'Post excluído com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir post:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao excluir post.', error: errorMessage }, { status: 500 });
    }
}