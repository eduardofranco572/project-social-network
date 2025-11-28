import Sequelize, { type Optional, type Sequelize as SequelizeInstance } from 'sequelize';
const { DataTypes, Model } = Sequelize;

import getSequelizeInstance from '../database/database';

interface UsuarioAttributes {
    USU_ID: number;
    USU_LOGIN: string;
    USU_SENHA: string;
    USU_NOME: string;
    USU_FOTO_PERFIL?: string;
    USU_BANNER?: string;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'USU_ID'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    public USU_ID!: number;
    public USU_LOGIN!: string;
    public USU_SENHA!: string;
    public USU_NOME!: string;
    public USU_FOTO_PERFIL?: string;
    public USU_BANNER?: string; 

}

export const initUsuarioModel = (sequelize: SequelizeInstance) => {
    if (sequelize.models.Usuario) {
        return;
    }

    Usuario.init({
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
        },

        USU_FOTO_PERFIL: {
            type: DataTypes.STRING,
            allowNull: true 
        },

        USU_BANNER: {
            type: DataTypes.STRING,
            allowNull: true 
        }
    }, {
        sequelize,
        tableName: 'TAB_USUARIO',
        modelName: 'Usuario',
        timestamps: false
    });
}

export default Usuario;