import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
    try {
        const cookieSerializado = serialize('auth_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: -1, 
            path: '/',
        });

        const response = NextResponse.json(
            { message: 'Logout realizado com sucesso!' }, 
            { status: 200 }
        );

        response.headers.set('Set-Cookie', cookieSerializado);

        return response;

    } catch (error) {
        console.error('Erro na rota API de logout:', error);
        return NextResponse.json({ message: 'Erro interno ao fazer logout.' }, { status: 500 });
    }
}