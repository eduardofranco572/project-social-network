import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/app/models/usuario';

export async function create(req) {
    try {
        const body = await req.json();
        const { email, nome, senha } = body;

        if (!email || !nome || !senha) {
            return NextResponse.json({ message: 'Campos não definidos' }, { status: 400 });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ message: 'E-mail já cadastrado!' }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const newUser = await User.create({
            nome,
            email,
            senha: hashedPassword
        });

        // Retorna os dados do usuário
        const userResponse = {
            id: newUser.USU_ID,
            nome: newUser.USU_NOME,
            email: newUser.USU_LOGIN
        };

        return NextResponse.json({
            message: 'Usuário cadastrado com sucesso!',
            user: userResponse
        }, { status: 201 });

    } catch (error) {
        console.error('Erro no controller:', error);
        return NextResponse.json({ message: 'Erro ao cadastrar usuário!' }, { status: 500 });
    }
}

// outras funções (login, update, delete, etc.)
// export async function login(req)....