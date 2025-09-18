import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize';

const connection = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        timezone: '-03:00'
    }
);

export default connection;