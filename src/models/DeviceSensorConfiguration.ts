import Session from './Session.js';
import Device from './Device.js';
import SessionDeviceMapping from './mappings/SessionDeviceMapping.js';
import SensorProperty from './SensorProperty.js';
import sequelize from '../sequelize.js';

import { Sequelize, DataTypes, Model } from 'sequelize'
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class DeviceSensorConfiguration extends Model {
    sessionId: number;
    deviceId: number;
    propertyName: string;
    active: boolean;
}

DeviceSensorConfiguration.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: SessionDeviceMapping, key: 'sessionId' } },
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: SessionDeviceMapping, key: 'deviceId' } },
    propertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: SensorProperty, key: 'propertyName' } },
    active: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'DeviceSensorConfiguration',
    tableName: 'DeviceSensorConfiguration',
    timestamps: false,
});

export default DeviceSensorConfiguration;
