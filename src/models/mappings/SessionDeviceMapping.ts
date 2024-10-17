import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SessionDeviceMapping extends Model {
    SessionId: number;
    DeviceId: number;
    ConfiguredHz: number;
}

SessionDeviceMapping.init({
    SessionId: { type: DataTypes.INTEGER, references: { model: 'Session', key: 'SessionId' }, allowNull: false },
    DeviceId: { type: DataTypes.INTEGER, references: { model: 'Device', key: 'DeviceId' }, allowNull: false },
    ConfiguredHz: { type: DataTypes.INTEGER, allowNull: false },
}, {
    sequelize,
    modelName: 'SessionDeviceMapping',
    tableName: 'SessionDeviceMapping',
    timestamps: false,
});

export default SessionDeviceMapping;
