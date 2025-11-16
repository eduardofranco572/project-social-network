import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
  foto: string;
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

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromToken(request);

        if (!user) {
            return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
        }

        return NextResponse.json(user, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return NextResponse.json({ message: 'Erro interno.' }, { status: 500 });
    }
}