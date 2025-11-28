import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import { recommendationService } from '@/src/services/recommendationService';

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

        await connectMongo();

        let postIds: string[] = [];

        if (user && user.id) {
            postIds = await recommendationService.getCollaborativeRecommendations(user.id, page, limit);
        }

        if (postIds.length < limit) {
            const randomCount = limit - postIds.length;
            
            const excludeIds = postIds.map((id: string) => {
                try { return new (require('mongoose').Types.ObjectId)(id) } catch { return null }
            }).filter(Boolean);

            const randomPosts = await Post.aggregate([
                { 
                    $match: { 
                        _id: { $nin: excludeIds },
                        likes: { $ne: user?.id }
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

        const posts = await Post.find({ _id: { $in: postIds } }).lean();

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
            hasMore: populatedPosts.length === limit
        }, { status: 200 });

    } catch (error) {
        console.error('Erro no Explore:', error);
        return NextResponse.json({ message: 'Erro interno', error: String(error) }, { status: 500 });
    }
}