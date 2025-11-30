import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';
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

        const savedByNumbers = post.savedBy ? post.savedBy.map((id: any) => parseInt(id, 10)) : [];
        const isSaved = savedByNumbers.includes(userId);
        
        let saved;

        if (isSaved) {
            await Post.findByIdAndUpdate(postId, { $pull: { savedBy: userId } });
            saved = false;
        } else {
            await Post.findByIdAndUpdate(postId, { $addToSet: { savedBy: userId } });
            saved = true;
        }

        return NextResponse.json({ saved });

    } catch (error) {
        console.error("Erro ao salvar post:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}