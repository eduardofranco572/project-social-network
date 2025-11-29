import getSequelizeInstance from './src/database/database';
import { initUsuarioModel } from './src/models/usuario';

async function syncDatabase() {
  const sequelize = getSequelizeInstance();
  
  try {
    initUsuarioModel(sequelize);

    await sequelize.sync({ alter: true });
    console.log('Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('Erro ao sincronizar o banco de dados:', error);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

syncDatabase();