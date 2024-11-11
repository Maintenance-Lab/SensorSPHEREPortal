import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Project extends Model {
    projectId: number;
    name: string;
    description: string;
    meta: object;
    createdAt: Date;
    lastActive: Date;
    // archived: boolean;
}

Project.init({
    projectId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.STRING(1000)},
    meta: { type: DataTypes.JSON, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    // archived: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'Project',
    tableName: 'Project',
    timestamps: false,
});

export default Project;
