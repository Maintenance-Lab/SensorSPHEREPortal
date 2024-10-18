import Session from './Session';
import Device from './Device';
import SensorProperty from './SensorProperty';
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
    sessionId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: Session, key: 'SessionId' } },
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: Device, key: 'DeviceId' } },
    propertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: SensorProperty, key: 'PropertyName' } },
    active: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'DeviceSensorConfiguration',
    tableName: 'DeviceSensorConfiguration',
    timestamps: false,
});

export default DeviceSensorConfiguration;
