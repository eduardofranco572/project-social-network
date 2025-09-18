import { DataTypes } from 'sequelize';
import connection from '../database/database.js';
import Usuario from './usuario.js';
import Chat from './chat.js';

const Mensagem = connection.define('TAB_MENSAGEM', {
    MEN_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    MEN_TEXTO: {
        type: DataTypes.STRING(1000),
        allowNull: false
    },
    MEN_DATA: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    CHAT_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Chat,
            key: 'CHAT_ID'
        }
    },
    USU_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'USU_ID'
        }
    }
}, {
    timestamps: false
});

Mensagem.belongsTo(Chat, { foreignKey: 'CHAT_ID' });
Mensagem.belongsTo(Usuario, { foreignKey: 'USU_ID' });

Chat.hasMany(Mensagem, { foreignKey: 'CHAT_ID' });
Usuario.hasMany(Mensagem, { foreignKey: 'USU_ID' });

export default Mensagem;