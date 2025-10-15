import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

import Usuario from '@/models/usuario';

dotenv.config();

let connection;
let isSynced = false;

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '-03:00',
        logging: false
    }
);

export async function connect() {
    if (connection) {
        return { connection, Usuario };
    }

    try {
        await sequelize.authenticate();
        connection = sequelize;
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        if (!isSynced) {
            await connection.sync({ alter: true });
            isSynced = true;
            console.log('Banco de dados sincronizado.');
        }
        
    } catch (error) {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', error);
        connection = null; 
        throw error;
    }

    return { connection, Usuario };
}

export { Usuario };