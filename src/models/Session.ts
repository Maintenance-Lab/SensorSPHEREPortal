import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Session extends Model {
    sessionId: number;
    // DeviceId: number;
    name: string;
    status: string;
    scheduledFrom: Date;
    scheduledTo: Date;
    // ProjectId: number;
    meta: object;
    createdAt: Date;
    lastActive: Date;
    archived: boolean;
}

Session.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DeviceId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Device, key: 'DeviceId' } },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['inactive', 'active', 'activeScheduled', 'paused', 'completed', 'error', 'scheduled', 'stopped']] } },
    scheduledFrom: { type: DataTypes.DATE, allowNull: false },
    scheduledTo: { type: DataTypes.DATE, allowNull: false },
    // ProjectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Project, key: 'ProjectId' } },
    meta: { type: DataTypes.JSON },
    createdAt: { type: DataTypes.DATE },
    lastActive: { type: DataTypes.DATE },
    archived: { type: DataTypes.BOOLEAN },
},
{
    sequelize,
    modelName: 'Session',
    tableName: 'Session',
    timestamps: false,
});

export default Session;
