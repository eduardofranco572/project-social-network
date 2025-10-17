import sequelize from './src/database/database';
import './src/models/usuario';
import './src/models/chat';
import './src/models/mensagem';

async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar o banco de dados:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();