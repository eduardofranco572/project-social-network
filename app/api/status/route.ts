import { NextResponse, type NextRequest } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Status from '@/src/models/status';  

import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import getSequelizeInstance from '@/src/database/database';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
}

async function getUserFromToken(request: NextRequest): Promise<JwtPayload | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
        return null;
    }
    
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return null;
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error('Token JWT inválido:', error);
        return null;
    }
}

// Helper de Upload
async function saveMedia(media: File): Promise<{ publicUrl: string, mediaType: string }> {
    const bytes = await media.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Nome de arquivo único
    const filename = `${Date.now()}-${media.name.replace(/\s/g, '_')}`;
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const filepath = path.join(uploadsDir, filename);
    
    // URL que o frontend usará
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
                throw new Error('Falha ao salvar mídia após criar diretório.');
            }
        } else {
           throw error;
        }
    }
    
    return { publicUrl, mediaType };
}

// Rota POST para criar Status
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);

        if (!user || !user.id) {
            return NextResponse.json({ message: 'Não autorizado. Faça login para postar.' }, { status: 401 });
        }

        await connectMongo();

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const description = formData.get('description') as string | null;

        if (!file) {
            return NextResponse.json({ message: 'Nenhum arquivo de mídia enviado.' }, { status: 400 });
        }

        // Salvar o arquivo imagem/vídeo
        const { publicUrl, mediaType } = await saveMedia(file);

        const newStatus = new Status({
            mediaUrl: publicUrl,
            mediaType: mediaType,
            description: description || '',
            authorId: user.id,
        });

        await newStatus.save();

        return NextResponse.json({
            message: 'Status postado com sucesso!',
            status: newStatus
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na rota API de status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao postar status.', error: errorMessage }, { status: 500 });
    }
}

interface AuthorWithStatuses {
    author: {
        id: number;
        nome: string;
        fotoPerfil: string;
    };
    statuses: {
        _id: string;
        mediaUrl: string;
        mediaType: string;
        description?: string;
        createdAt: Date;
    }[];
}

export async function GET(request: NextRequest) {
    try {
        await connectMongo();

        // Buscar todos os status
        const allStatuses = await Status.find().sort({ authorId: 1, createdAt: 1 }).exec();

        if (!allStatuses || allStatuses.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        // Agrupar status por authorId no Mongo
        const statusMap = new Map<number, any[]>();
        const authorIds = new Set<number>();

        for (const status of allStatuses) {
            if (!statusMap.has(status.authorId)) {
                statusMap.set(status.authorId, []);
            }

            statusMap.get(status.authorId)?.push({
                _id: status._id.toString(),
                mediaUrl: status.mediaUrl,
                mediaType: status.mediaType,
                description: status.description,
                createdAt: status.createdAt,
            });

            authorIds.add(status.authorId);
        }

        // Buscar dados dos autores no Sequelize
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const authors = await Usuario.findAll({
            where: {
                USU_ID: Array.from(authorIds)
            },
            attributes: ['USU_ID', 'USU_NOME', 'USU_FOTO_PERFIL']
        });

        // Mapear autores
        const authorMap = new Map(authors.map(author => [author.USU_ID, author]));

        // Combinar dados e criar a resposta final
        const responseData: AuthorWithStatuses[] = [];
        for (const authorId of Array.from(authorIds)) {
            const author = authorMap.get(authorId);
            const statuses = statusMap.get(authorId);

            if (author && statuses) {
                responseData.push({
                    author: {
                        id: author.USU_ID,
                        nome: author.USU_NOME || 'Usuário Desconhecido',
                        fotoPerfil: author.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
                    },
                    statuses: statuses
                });
            }
        }
        
        // Ordenar os status mais recentes apareçam primeiro na lista
        responseData.sort((a, b) => {
            const lastStatusA = new Date(a.statuses[a.statuses.length - 1].createdAt).getTime();
            const lastStatusB = new Date(b.statuses[b.statuses.length - 1].createdAt).getTime();
            return lastStatusB - lastStatusA;
        });

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao buscar status.', error: errorMessage }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        if (!user || !user.id) {
            return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
        }

        const { statusId } = await request.json();
        if (!statusId) {
            return NextResponse.json({ message: 'ID do status é obrigatório.' }, { status: 400 });
        }

        await connectMongo();

        const status = await Status.findById(statusId);
        if (!status) {
            return NextResponse.json({ message: 'Status não encontrado.' }, { status: 404 });
        }

        // Verificação de propriedade
        if (status.authorId !== user.id) {
            return NextResponse.json({ message: 'Você não tem permissão para excluir este status.' }, { status: 403 });
        }

        // Excluir o arquivo do disco
        try {
            const filePath = path.join(process.cwd(), 'public', status.mediaUrl);
            await unlink(filePath);
        } catch (fileError) {
            console.warn(`Falha ao excluir arquivo: ${status.mediaUrl}`, fileError);
        }

        // Excluir o documento do MongoDB
        await Status.findByIdAndDelete(statusId);

        return NextResponse.json({ message: 'Status excluído com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao excluir status.', error: errorMessage }, { status: 500 });
    }
}