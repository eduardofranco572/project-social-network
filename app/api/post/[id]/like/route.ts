import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
import { publishToQueue } from '@/src/lib/rabbitmq'; 
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    try {
        const decoded = jwt.verify(token, secret) as any;
        return parseInt(decoded.id, 10);
    } catch { return null; }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const userId = await getUserIdFromToken(request);
    const postId = params.id;

    if (!userId) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    try {
        await connectMongo();
        
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json({ message: 'Post não encontrado' }, { status: 404 });
        }

        const likesNumbers = post.likes.map((id: any) => parseInt(id, 10));
        const hasLiked = likesNumbers.includes(userId);
        
        let action: 'LIKE' | 'UNLIKE';
        let updatedPost;

        if (hasLiked) {
            updatedPost = await Post.findByIdAndUpdate(
                postId, 
                { $pull: { likes: userId } },
                { new: true } 
            );

            action = 'UNLIKE';
        } else {

            updatedPost = await Post.findByIdAndUpdate(
                postId, 
                { $addToSet: { likes: userId } },
                { new: true }
            );

            action = 'LIKE';
        }
        
        await publishToQueue('user_interactions', {
            type: 'LIKE',
            userId,
            postId,
            action
        });

        return NextResponse.json({ 
            liked: action === 'LIKE',
            likesCount: updatedPost.likes.length
        });

    } catch (error) {
        console.error("Erro no like:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}