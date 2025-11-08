import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario'; 
import { writeFile } from 'fs/promises';
import path from 'path';

async function saveImage(imagem: File): Promise<string> {
    const bytes = await imagem.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${imagem.name.replace(/\s/g, '_')}`;
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const filepath = path.join(uploadsDir, filename);
    
    const publicUrl = `/uploads/${filename}`;

    try {
        await writeFile(filepath, buffer);
        console.log(`Arquivo salvo em: ${filepath}`);
        return publicUrl;
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            try {
                const fs = require('fs/promises');
                await fs.mkdir(uploadsDir, { recursive: true });
                console.log(`Diretório criado: ${uploadsDir}`);

                await writeFile(filepath, buffer);
                console.log(`Arquivo salvo em: ${filepath}`);

                return publicUrl;
            } catch (mkdirError) {
                console.error('Erro ao criar diretório:', mkdirError);
                throw new Error('Falha ao salvar imagem após criar diretório.');
            }
        }
        throw error;
    }
}


export async function POST(req: Request) {
    try {
        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize); 
        await sequelize.authenticate();

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

        const existingUser = await Usuario.findOne({ 
            where: { USU_LOGIN: email } 
        });

        if (existingUser) {
            return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 });
        }

        let imageUrl: string | undefined = undefined;
        if (imagem) {
            try {
                imageUrl = await saveImage(imagem);
            } catch (uploadError) {
                console.error('Erro no upload:', uploadError);

                const errorMessage = uploadError instanceof Error ? uploadError.message : String(uploadError);
                return NextResponse.json({ message: 'Erro ao processar a imagem.', error: errorMessage }, { status: 500 });
            }
        }

        const hashedPassword = await bcrypt.hash(senha, 10); 

        const newUser = await Usuario.create({
            USU_NOME: nome,
            USU_LOGIN: email,
            USU_SENHA: hashedPassword,
            USU_FOTO_PERFIL: imageUrl,
        });

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