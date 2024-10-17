import Sensor from './Sensor';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Device extends Model {
    DeviceId: number;
    // ManufacturerName: string;
    // Model: string;
    ConnectStatus: boolean;
    MaxHz: number;
}

Device.init({
    // Device id should be a mac address, maybe double check if this is correct?
    DeviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, validate: { is: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/} },
    // ManufacturerName: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'ManufacturerName' } },
    // Model: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'Model' } },
    ConnectStatus: { type: DataTypes.BOOLEAN, defaultValue: false},
    MaxHz: { type: DataTypes.INTEGER, defaultValue: 0},
},
{
    sequelize,
    modelName: 'Device',
    tableName: 'Device',
    timestamps: false,
});

export default Device;
