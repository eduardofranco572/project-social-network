import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getSequelizeInstance from '@/src/database/database';

import Usuario, { initUsuarioModel } from '@/src/models/usuario'; 

export async function POST(req) {
    try {
        const sequelize = getSequelizeInstance();

        initUsuarioModel(sequelize); 

        await sequelize.authenticate();

        const body = await req.json();
        const { email, nome, senha } = body;

        if (!email || !nome || !senha) {
            return NextResponse.json({ message: 'Todos os campos são obrigatórios.' }, { status: 400 });
        }

        if (senha.length < 6) {
            return NextResponse.json({ message: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
        }

        const existingUser = await Usuario.findOne({ 
            where: { USU_LOGIN: email } 
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(senha, 10); 

        const newUser = await Usuario.create({
            USU_NOME: nome,
            USU_LOGIN: email,
            USU_SENHA: hashedPassword,
        });

        return NextResponse.json({
            message: 'Usuário cadastrado com sucesso!',
            user: { 
                id: newUser.USU_ID, 
                nome: newUser.USU_NOME, 
                email: newUser.USU_LOGIN 
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na rota API de cadastro:', error);

        return NextResponse.json({ message: 'Erro interno ao cadastrar usuário.', error: error.message }, { status: 500 });
    }
}