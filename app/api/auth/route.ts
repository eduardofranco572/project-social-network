import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

const SECRET_KEY = process.env.JWT_SECRET || 'sua-chave-secreta-deve-ser-longa-e-segura';

export async function POST(req) {
  try {
    const sequelize = getSequelizeInstance();

    initUsuarioModel(sequelize);
    
    await sequelize.authenticate();

    const body = await req.json();
    const { email, senha } = body;

    if (!email || !senha) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios' }, { status: 400 });
    }

    //Procura o usuário no banco pelo email
    const user = await Usuario.findOne({ where: { USU_LOGIN: email } });
    if (!user) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    const isPasswordCorrect = await bcrypt.compare(senha, user.USU_SENHA);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    // Cria o token
    const tokenPayload = { userId: user.USU_ID, email: user.USU_LOGIN };
    const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '1h' }); 

    // Define o cookie no navegador do usuário
    cookies().set('session_token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 60 * 60, 
      path: '/',
    });

    return NextResponse.json({ message: 'Login bem-sucedido!' }, { status: 200 });

  } catch (error) {
    console.error('Erro na API de login:', error);
    return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
  }
}