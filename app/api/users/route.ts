import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario'; 
import { saveFile } from '@/src/lib/uploadUtils';

export async function POST(req: Request) {
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize); 

        const formData = await req.formData();
        const email = formData.get('email') as string;
        const nome = formData.get('nome') as string;
        const senha = formData.get('senha') as string;
        const imagem = formData.get('imagem') as File | null;

        if (!email || !nome || !senha) {
            return NextResponse.json({ message: 'Todos os campos (nome, email, senha) são obrigatórios.' }, { status: 400 });
        }

        if (senha.length < 6) {
            return NextResponse.json({ message: 'A senha deve ter no mínimo 6 caracteres.' }, { status: 400 });
        }

        const existingUser = await Usuario.findOne({ where: { USU_LOGIN: email } });

        if (existingUser) {
            return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 });
        }

        const hashedPassword = await bcrypt.hash(senha, 10); 

        const newUser = await Usuario.create({
            USU_NOME: nome,
            USU_LOGIN: email,
            USU_SENHA: hashedPassword,
            USU_FOTO_PERFIL: undefined,
        });

        if (imagem && newUser.USU_ID) {
            try {
                const imageUrl = await saveFile(imagem, 'profiles', newUser.USU_ID);
            
                newUser.USU_FOTO_PERFIL = imageUrl;
                await newUser.save();
            } catch (uploadError) {
                console.error('Erro no upload de perfil:', uploadError);
            }
        }

        return NextResponse.json({
            message: 'Usuário cadastrado com sucesso!',
            user: { 
                id: newUser.USU_ID, 
                nome: newUser.USU_NOME, 
                email: newUser.USU_LOGIN,
                foto: newUser.USU_FOTO_PERFIL
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Erro na rota API de cadastro:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ message: 'Erro interno ao cadastrar usuário.', error: errorMessage }, { status: 500 });
    }
}