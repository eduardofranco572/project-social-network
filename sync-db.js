import connection from './src/database/database.js'; 

import Usuario from './src/models/usuario.js';
import Chat from './src/models/chat.js';
import Mensagem from './src/models/mensagem.js';

async function syncDatabase() {
  try {
    await connection.sync({ alter: true });
    console.log('✅ Banco de dados sincronizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao sincronizar o banco de dados:', error);
  } finally {
    await connection.close();
  }
}

syncDatabase();