import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
import Project from './Project.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Session extends Model {
    sessionId: number;
    // DeviceId: number;
    name: string;
    status: string;
    scheduledFrom: Date;
    scheduledTo: Date;
    projectId: number;
    meta: object;
    createdAt: Date;
    lastActive: Date;
    archived: boolean;
}

Session.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DeviceId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Device, key: 'DeviceId' } },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['inactive', 'active', 'activeScheduled', 'paused', 'completed', 'error', 'scheduled', 'stopped']] }, defaultValue: 'inactive' },
    scheduledFrom: { type: DataTypes.DATE},
    scheduledTo: { type: DataTypes.DATE},
    projectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Project, key: 'projectId' } },
    meta: { type: DataTypes.JSON },
    createdAt: { type: DataTypes.DATE,  defaultValue: DataTypes.NOW },
    lastActive: { type: DataTypes.DATE,  defaultValue: DataTypes.NOW },
    archived: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'Session',
    tableName: 'Session',
    timestamps: false,
});

export default Session;
