import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import { recommendationService } from '@/src/services/recommendationService';
import { getNeo4jDriver } from '@/src/database/neo4j'; // Importar driver Neo4j

async function getUserFromToken(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    try {
        return jwt.verify(token, secret) as any;
    } catch { return null; }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);
        const { searchParams } = request.nextUrl;
        
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '15', 10);

        let excludedAuthorIds: number[] = [];
        
        if (user && user.id) {
            excludedAuthorIds.push(user.id);

            const driver = getNeo4jDriver();
            const session = driver.session();

            try {
                // IDs de quem o usuário segue
                const result = await session.run(
                    `
                    MATCH (u:User {id: $userId})-[:FOLLOWS]->(following:User)
                    RETURN following.id AS id
                    `,
                    { userId: user.id }
                );

                const followingIds = result.records.map(record => {
                    const idVal = record.get('id');

                    if (idVal && typeof idVal === 'object' && 'toNumber' in idVal) {
                        return idVal.toNumber();
                    }

                    return Number(idVal);
                });

                excludedAuthorIds = [...excludedAuthorIds, ...followingIds];

            } catch (neoError) {
                console.error("Erro ao buscar seguidores no Explore:", neoError);
            } finally {
                await session.close();
            }
        }

        await connectMongo();

        let postIds: string[] = [];

        // Buscar Recomendações
        if (user && user.id) {
            postIds = await recommendationService.getCollaborativeRecommendations(user.id, page, limit);
        }

        // Backfill com posts aleatórios
        if (postIds.length < limit) {
            const randomCount = limit - postIds.length;
            
            const excludeIds = postIds.map((id: string) => {
                try { return new (require('mongoose').Types.ObjectId)(id) } catch { return null }
            }).filter(Boolean);

            const randomPosts = await Post.aggregate([
                { 
                    $match: { 
                        _id: { $nin: excludeIds },
                        likes: { $ne: user?.id },
                        authorId: { $nin: excludedAuthorIds } // Remove posts de seguidos/eu
                    } 
                },
                { $sample: { size: randomCount } },
                { $project: { _id: 1 } }
            ]);

            const randomIds = randomPosts.map((p: any) => p._id.toString());
            postIds = [...postIds, ...randomIds];
        }

        if (postIds.length === 0) {
            return NextResponse.json({ 
                posts: [],
                hasMore: false 
            }, { status: 200 });
        }

        const posts = await Post.find({ 
            _id: { $in: postIds },
            authorId: { $nin: excludedAuthorIds }
        }).lean();

        const authorIds = Array.from(new Set(posts.map(post => post.authorId)));
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);
        
        const authors = await Usuario.findAll({
            where: { USU_ID: authorIds },
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

        populatedPosts.sort(() => Math.random() - 0.5);

        return NextResponse.json({ 
            posts: populatedPosts,
            hasMore: populatedPosts.length > 0
        }, { status: 200 });

    } catch (error) {
        console.error('Erro no Explore:', error);
        return NextResponse.json({ message: 'Erro interno', error: String(error) }, { status: 500 });
    }
}