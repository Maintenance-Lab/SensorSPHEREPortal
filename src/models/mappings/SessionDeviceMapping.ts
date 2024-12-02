import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SessionDeviceMapping extends Model {
    sessionId: number;
    deviceId: number;
    configuredHz: number;
}

SessionDeviceMapping.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true,  references: { model: 'Session', key: 'sessionId' }, allowNull: false },
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'Device', key: 'deviceId' },  allowNull: false },
    configuredHz: { type: DataTypes.INTEGER, allowNull: false },
}, {
    sequelize,
    modelName: 'SessionDeviceMapping',
    tableName: 'SessionDeviceMapping',
    timestamps: false,
});

export default SessionDeviceMapping;
