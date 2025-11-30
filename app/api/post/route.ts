import { NextResponse, type NextRequest } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import { getNeo4jDriver } from '@/src/database/neo4j';
import { saveFile } from '@/src/lib/uploadUtils';
import { publishToQueue } from '@/src/lib/rabbitmq';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
  foto?: string;
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

export async function POST(request: NextRequest) {
    const driver = getNeo4jDriver();
    const session = driver.session();

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

        // Salvar arquivos no disco
        const savePromises = files.map(async (file) => {
            const publicUrl = await saveFile(file, 'posts', user.id);
            const absolutePath = path.join(process.cwd(), 'public', publicUrl);

            return {
                url: publicUrl,
                type: file.type,
                absolutePath: absolutePath
            };
        });

        const processedFiles = await Promise.all(savePromises);
        
        const mediaItems = processedFiles.map(f => ({ url: f.url, type: f.type }));

        const newPost = new Post({
            media: mediaItems,
            description: description || '',
            authorId: user.id,
            authorName: user.nome, 
            authorPhoto: user.foto || '/img/iconePadrao.svg',
            autoTags: []
        });

        await newPost.save();

        // Enviar para IA
        processedFiles.forEach((file) => {
            if (file.type.startsWith('image/')) {
                publishToQueue('image_classification', {
                    postId: newPost._id.toString(),
                    filePath: file.absolutePath,
                    mimeType: file.type
                });
            }
        });

        // Salvar no Neo4j
        try {
            await session.run(
                `
                MERGE (p:Post {id: $postId})
                SET p.createdAt = datetime()
                `,
                { postId: newPost._id.toString() }
            );
        } catch (neoError) {
            console.error("Erro ao salvar post no Neo4j:", neoError);
        }

      const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const dadosAtualizadosUsuario = await Usuario.findByPk(user.id, {
            attributes: ['USU_NOME', 'USU_FOTO_PERFIL']
        });

        const postObject = newPost.toObject();
        
        const postParaSocket = {
            ...postObject,
            _id: newPost._id.toString(),
            media: postObject.media.map((m: any) => ({
                ...m,
                _id: m._id ? m._id.toString() : Math.random().toString()
            })),
            author: {
                id: user.id,
                nome: dadosAtualizadosUsuario?.USU_NOME || user.nome,
                fotoPerfil: dadosAtualizadosUsuario?.USU_FOTO_PERFIL || '/img/iconePadrao.svg'
            }
        };

        await publishToQueue('realtime_events', {
            event: 'new_post',
            data: postParaSocket
        });

        return NextResponse.json({
            message: 'Post criado com sucesso!',
            post: newPost
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na rota API de post:', error);
        return NextResponse.json(
            { message: 'Erro interno ao criar post.' }, { status: 500 }
        );

    } finally {
        await session.close();
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const targetUserId = searchParams.get('userId');

        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '15', 10);
        const offset = (page - 1) * limit;

        let query = {};

        if (targetUserId) {
            query = { authorId: parseInt(targetUserId) };
        } else {
            const user = await getUserFromToken(request);

            if (!user || !user.id) {
                return NextResponse.json({
                    posts: [],
                    page,
                    hasMore: false,
                }, { status: 200 });
            }

            const driver = getNeo4jDriver();
            const session = driver.session();
            let followingIds: number[] = [];

            try {
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
                console.error("Erro ao buscar seguidores no Feed:", neoError);
            } finally {
                await session.close();
            }

            const allowedAuthorIds = [...followingIds, user.id];
            query = { authorId: { $in: allowedAuthorIds } };
        }

        await connectMongo();

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .lean(); 

        const totalPosts = await Post.countDocuments(query);

        const populatedPosts = posts.map((post: any) => ({
            ...post,
            _id: post._id.toString(),
            likes: (post.likes || []).map((id: any) => parseInt(id, 10)),
            author: {
                id: post.authorId,
                nome: post.authorName,
                fotoPerfil: post.authorPhoto
            }
        }));

        return NextResponse.json({
            posts: populatedPosts,
            page: page,
            hasMore: (offset + posts.length) < totalPosts,
        }, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
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

        // Apagar arquivos
        for (const media of post.media) {
            try {
                const filePath = path.join(process.cwd(), 'public', media.url);
                await unlink(filePath);
            } catch (fileError) {
                console.warn(`Falha ao excluir arquivo do disco: ${media.url}`, fileError);
            }
        }

        await Post.findByIdAndDelete(postId);

        const driver = getNeo4jDriver();
        const session = driver.session();
        try {
            await session.run(
                `MATCH (p:Post {id: $postId}) DETACH DELETE p`,
                { postId: postId }
            );

        } catch(neoError) {
             console.error("Erro ao deletar post do Neo4j", neoError);
        } finally {
            await session.close();
        }

        await publishToQueue('realtime_events', {
            event: 'delete_post',
            data: { postId } 
        });

        return NextResponse.json({ message: 'Post excluído com sucesso' }, { status: 200 });

    } catch (error) {
        console.error('Erro ao excluir post:', error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}