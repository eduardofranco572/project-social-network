import { NextResponse, NextRequest } from 'next/server';
import getSequelizeInstance from '@/src/database/database';
import Usuario, { initUsuarioModel } from '@/src/models/usuario';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.trim().length === 0) {
            return NextResponse.json([], { status: 200 });
        }

        const sequelize = getSequelizeInstance();
        initUsuarioModel(sequelize);

        const users = await Usuario.findAll({
            where: {
                USU_NOME: {
                    [Op.like]: `%${query}%` 
                }
            },
            attributes: ['USU_ID', 'USU_NOME', 'USU_LOGIN', 'USU_FOTO_PERFIL'],
            limit: 10 
        });

        const formattedUsers = users.map(u => ({
            id: u.USU_ID,
            nome: u.USU_NOME,
            username: u.USU_LOGIN.split('@')[0], 
            foto: u.USU_FOTO_PERFIL || null
        }));

        return NextResponse.json(formattedUsers, { status: 200 });

    } catch (error) {
        console.error("Erro na busca de usuários:", error);
        return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
    }
}