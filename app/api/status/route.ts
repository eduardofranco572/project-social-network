import { NextResponse, type NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path'; 
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Status from '@/src/models/status';  
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import getSequelizeInstance from '@/src/database/database';
import { getNeo4jDriver } from '@/src/database/neo4j';
import { saveFile } from '@/src/lib/uploadUtils'; 

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
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded;
    } catch (error) {
        console.error('Token JWT inválido:', error);
        return null;
    }
}

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

        const publicUrl = await saveFile(file, 'status', user.id);

        const newStatus = new Status({
            mediaUrl: publicUrl,
            mediaType: file.type,
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
        const user = await getUserFromToken(request);

        if (!user || !user.id) {
            return NextResponse.json([], { status: 200 });
        }

        const driver = getNeo4jDriver();
        const session = driver.session();
        let followingIds: number[] = [];

        try {
            // Busca quem o usuário segue no Neo4j
            const result = await session.run(
                `
                MATCH (u:User {id: $userId})-[:FOLLOWS]->(following:User)
                RETURN following.id AS id
                `,
                { userId: user.id }
            );

            followingIds = result.records.map(record => {
                const idVal = record.get('id');
                if (idVal && typeof idVal === 'object' && 'toNumber' in idVal) {
                    return idVal.toNumber();
                }
                return Number(idVal);
            });
            
        } catch (neoError) {
            console.error("Erro ao buscar seguidores no Neo4j", neoError);
        } finally {
            await session.close();
        }

        const allowedAuthorIds = [...followingIds, user.id];

        await connectMongo();

        const allStatuses = await Status.find({
            authorId: { $in: allowedAuthorIds }
        }).sort({ authorId: 1, createdAt: 1 }).exec();

        if (!allStatuses || allStatuses.length === 0) {
            return NextResponse.json([], { status: 200 });
        }

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

        const responseData: AuthorWithStatuses[] = [];
        
        for (const authorId of Array.from(statusMap.keys())) {
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
        
        responseData.sort((a, b) => {
            if (a.author.id === user.id) return -1;
            if (b.author.id === user.id) return 1;

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

        if (status.authorId !== user.id) {
            return NextResponse.json({ message: 'Você não tem permissão para excluir este status.' }, { status: 403 });
        }

        try {
            const filePath = path.join(process.cwd(), 'public', status.mediaUrl);
            await unlink(filePath);

        } catch (fileError) {
            console.warn(`Falha ao excluir arquivo: ${status.mediaUrl}`, fileError);
        }

        await Status.findByIdAndDelete(statusId);

        return NextResponse.json({ message: 'Status excluído com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir status:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao excluir status.', error: errorMessage }, { status: 500 });
    }
}