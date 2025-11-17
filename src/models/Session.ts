import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
import Project from './Project.js';

class Session extends Model {
    sessionId: number;
    // DeviceId: number;
    name: string;
    description: string;
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
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING},
    // status: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['inactive', 'active', 'activeScheduled', 'paused', 'completed', 'error', 'scheduled', 'stopped']] }, defaultValue: 'inactive' },
    status: { type: DataTypes.STRING, allowNull: true, validate: { isIn: [['Idle', 'Measuring']] }, defaultValue: 'Idle' },
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
