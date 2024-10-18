import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SessionDeviceMapping extends Model {
    sessionId: number;
    deviceId: number;
    configuredHz: number;
}

SessionDeviceMapping.init({
    sessionId: { type: DataTypes.INTEGER, references: { model: 'Session', key: 'SessionId' }, allowNull: false },
    deviceId: { type: DataTypes.INTEGER, references: { model: 'Device', key: 'DeviceId' }, allowNull: false },
    configuredHz: { type: DataTypes.INTEGER, allowNull: false },
}, {
    sequelize,
    modelName: 'SessionDeviceMapping',
    tableName: 'SessionDeviceMapping',
    timestamps: false,
});

export default SessionDeviceMapping;
