import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Session extends Model {
    SessionId: number;
    // DeviceId: number;
    Name: string;
    Status: string;
    ScheduledFrom: Date;
    ScheduledTo: Date;
    // ProjectId: number;
    Meta: object;
    CreatedAt: Date;
    LastActive: Date;
    Archived: boolean;
}

Session.init({
    SessionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // DeviceId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Device, key: 'DeviceId' } },
    Name: { type: DataTypes.STRING, allowNull: false },
    Status: { type: DataTypes.STRING, allowNull: false, validate: { isIn: [['inactive', 'active', 'activeScheduled', 'paused', 'completed', 'error', 'scheduled', 'stopped']] } },
    ScheduledFrom: { type: DataTypes.DATE, allowNull: false },
    ScheduledTo: { type: DataTypes.DATE, allowNull: false },
    // ProjectId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Project, key: 'ProjectId' } },
    Meta: { type: DataTypes.JSON },
    CreatedAt: { type: DataTypes.DATE },
    LastActive: { type: DataTypes.DATE },
    Archived: { type: DataTypes.BOOLEAN },
},
{
    sequelize,
    modelName: 'Session',
    tableName: 'Session',
    timestamps: false,
});

export default Session;
