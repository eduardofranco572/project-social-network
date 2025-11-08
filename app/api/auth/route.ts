import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

import { serialize } from 'cookie';

export async function POST(req: Request) {
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);

        const { email, senha } = await req.json();

        if (!email || !senha) {
            return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
        }

        // Encontrar o usuário pelo email 
        const usuario = await Usuario.findOne({
            where: { USU_LOGIN: email }
        });

        if (!usuario) {
            return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
        }

        // Comparar a senha enviada com a senha hashada do banco
        const senhaValida = await bcrypt.compare(senha, usuario.USU_SENHA);

        if (!senhaValida) {
            return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET não está definido no .env');
        }

        // Criar o Token JWT
        const tokenPayload = {
            id: usuario.USU_ID,
            nome: usuario.USU_NOME,
            email: usuario.USU_LOGIN,
            foto: usuario.USU_FOTO_PERFIL
        };

        const token = jwt.sign(tokenPayload, secret, {
            expiresIn: '7d'
        });

        // Serializar o cookie
        const cookieSerializado = serialize('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });

        // Retornar a resposta com o cookie no cabeçalho
        const response = NextResponse.json({
            message: 'Login realizado com sucesso!',
            user: tokenPayload
        }, { status: 200 });

        response.headers.set('Set-Cookie', cookieSerializado);

        return response;

    } catch (error) {
        console.error('Erro na rota API de login:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao fazer login.', error: errorMessage }, { status: 500 });
    }
}