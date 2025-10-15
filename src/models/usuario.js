//exemplo de como criar coluna com sequilize só usar ts devez js

import { DataTypes } from 'sequelize';
import connection from '../database/database.js';

const Usuario = connection.define('TAB_USUARIO', {
    USU_ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    USU_LOGIN: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    USU_SENHA: {
        type: DataTypes.STRING,
        allowNull: false
    },
    USU_NOME: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

export default Usuario;