import { NextResponse, type NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';

interface JwtPayload {
  id: number;
  nome: string;
  email: string;
  foto: string;
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        const secret = process.env.JWT_SECRET;

        if (!token || !secret) {
            return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
        }

        let userId: number;
        try {
            const decoded = jwt.verify(token, secret) as JwtPayload;
            userId = decoded.id;
        } catch (error) {
            return NextResponse.json({ message: 'Token inválido.' }, { status: 401 });
        }

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);

        const usuarioAtualizado = await Usuario.findOne({
            where: { USU_ID: userId },
            attributes: ['USU_ID', 'USU_NOME', 'USU_LOGIN', 'USU_FOTO_PERFIL']
        });

        if (!usuarioAtualizado) {
            return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
        }

        const userData = {
            id: usuarioAtualizado.USU_ID,
            nome: usuarioAtualizado.USU_NOME,
            email: usuarioAtualizado.USU_LOGIN,
            foto: usuarioAtualizado.USU_FOTO_PERFIL
        };

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        console.error('Erro ao buscar usuário atual:', error);
        return NextResponse.json({ message: 'Erro interno.' }, { status: 500 });
    }
}