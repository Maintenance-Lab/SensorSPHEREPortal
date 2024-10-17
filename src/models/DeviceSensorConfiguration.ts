import Session from './Session';
import Device from './Device';
import SensorProperty from './SensorProperty';
import sequelize from '../sequelize.js';

import { Sequelize, DataTypes, Model } from 'sequelize'
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class DeviceSensorConfiguration extends Model {
    SessionId: number;
    DeviceId: number;
    PropertyName: string;
    Active: boolean;
}

DeviceSensorConfiguration.init({
    SessionId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: Session, key: 'SessionId' } },
    DeviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: Device, key: 'DeviceId' } },
    PropertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: SensorProperty, key: 'PropertyName' } },
    Active: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'DeviceSensorConfiguration',
    tableName: 'DeviceSensorConfiguration',
    timestamps: false,
});

export default DeviceSensorConfiguration;
