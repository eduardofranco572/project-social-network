import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs'; 
// import { connect, Usuario } from '@/database/database'; 

export async function POST(req) {

    return NextResponse.json({
        message: 'Modo de teste visual: Usuário cadastrado com sucesso!',
        user: { id: 1, nome: 'Usuário Teste', email: 'teste@email.com' }
    }, { status: 201 });
    
    /* 
    try {
        await connect();

        const body = await req.json();
        const { email, nome, senha } = body;

        if (!email || !nome || !senha) {
            return NextResponse.json({ message: 'Campos não definidos' }, { status: 400 });
        }
        // ... resto da lógica
    } catch (error) {
        console.error('Erro na rota API:', error);
        return NextResponse.json({ message: 'Erro ao cadastrar usuário!' }, { status: 500 });
    }
    */
}