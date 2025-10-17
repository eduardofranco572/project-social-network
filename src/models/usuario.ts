import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../database/database';

interface UsuarioAttributes {
    USU_ID: number;
    USU_LOGIN: string;
    USU_SENHA: string;
    USU_NOME: string;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'USU_ID'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
    public USU_ID!: number;
    public USU_LOGIN!: string;
    public USU_SENHA!: string;
    public USU_NOME!: string;
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
    }
}, {
    sequelize,
    tableName: 'TAB_USUARIO',
    timestamps: false
});

export default Usuario;