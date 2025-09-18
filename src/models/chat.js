import { DataTypes } from 'sequelize';
import connection from '../database/database.js';
import Usuario from './usuario.js';

const Chat = connection.define('TAB_CHAT', {
    CHAT_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    USU_ID1: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario,
            key: 'USU_ID'
        }
    },
    USU_ID2: {
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

Chat.belongsTo(Usuario, { as: 'Usuario1', foreignKey: 'USU_ID1' });
Chat.belongsTo(Usuario, { as: 'Usuario2', foreignKey: 'USU_ID2' });

export default Chat;