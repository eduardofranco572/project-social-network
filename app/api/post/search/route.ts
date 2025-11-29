import { NextResponse, NextRequest } from 'next/server';
import connectMongo from '@/src/database/mongo';
import Post from '@/src/models/post';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let query = searchParams.get('q'); 

        if (!query || query.trim().length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        await connectMongo();

        const translations: Record<string, string> = {
            'gato': 'cat',
            'gatinho': 'cat',
            'cachorro': 'dog',
            'cao': 'dog',
            'cão': 'dog',
            'carro': 'car',
            'comida': 'food',
            'pessoa': 'person',
            'homem': 'person',
            'mulher': 'person',
            'praia': 'beach',
            'computador': 'laptop',
            'celular': 'cell phone'
        };

        const lowerQuery = query.toLowerCase();

        if (translations[lowerQuery]) {
            query = `${query} ${translations[lowerQuery]}`;
        }

        const posts = await Post.find(
            { $text: { $search: query } },
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(20)
        .lean();

        const formattedPosts = posts.map((p: any) => ({
            _id: p._id.toString(),
            media: p.media[0], 
            description: p.description
        }));

        return NextResponse.json(formattedPosts, { status: 200 });

    } catch (error) {
        console.error("Erro na busca de posts:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}