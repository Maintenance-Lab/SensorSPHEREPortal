import Sensor from './Sensor';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Device extends Model {
    deviceId: number;
    // ManufacturerName: string;
    // Model: string;
    connectStatus: boolean;
    maxHz: number;
}

Device.init({
    // Device id should be a mac address, maybe double check if this is correct?
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, validate: { is: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/} },
    // ManufacturerName: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'ManufacturerName' } },
    // Model: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'Model' } },
    connectStatus: { type: DataTypes.BOOLEAN, defaultValue: false},
    maxHz: { type: DataTypes.INTEGER, defaultValue: 0},
},
{
    sequelize,
    modelName: 'Device',
    tableName: 'Device',
    timestamps: false,
});

export default Device;
