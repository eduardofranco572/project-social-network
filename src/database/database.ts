import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelizeInstance: Sequelize | null = null;

const getSequelizeInstance = () => {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      process.env.DB_NAME || 'rede_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
          dialect: 'mysql',
          timezone: '-03:00',
          logging: false
      }
    );
  }
  return sequelizeInstance;
};

export default getSequelizeInstance;