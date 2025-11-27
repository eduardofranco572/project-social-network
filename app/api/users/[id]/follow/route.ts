import { NextResponse, type NextRequest } from 'next/server';
import { followService } from '@/src/services/followService';
import jwt from 'jsonwebtoken';

async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) return null;

    const secret = process.env.JWT_SECRET;

    if (!secret) return null;

    try {
        const decoded = jwt.verify(token, secret) as any;
        return decoded.id;
    } catch { return null; }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const loggedUserId = await getUserIdFromToken(request);
    const targetUserId = parseInt(params.id);

    if (!loggedUserId) {
        return NextResponse.json(
            { message: 'Não autorizado' }, { status: 401 }
        );
    }

    try {
        const data = await followService.getFollowStatus(loggedUserId, targetUserId);
        return NextResponse.json(data);

    } catch (error) {
        console.error("Erro Neo4j GET:", error);
        return NextResponse.json({ message: 'Erro ao buscar dados de seguidor' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const loggedUserId = await getUserIdFromToken(request);
    const targetUserId = parseInt(params.id);

    if (!loggedUserId) {
        return NextResponse.json(
            { message: 'Não autorizado' }, { status: 401 }
        );
    }

    if (loggedUserId === targetUserId) {
        return NextResponse.json(
            { message: 'Você não pode seguir a si mesmo' }, { status: 400 }
        );
    } 

    try {
        const result = await followService.toggleFollow(loggedUserId, targetUserId);
        return NextResponse.json(result);
        
    } catch (error) {
        console.error("Erro Neo4j POST:", error);
        return NextResponse.json({ message: 'Erro ao processar ação' }, { status: 500 });
    }
}