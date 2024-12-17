import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
import Manufacturer from './Manufacturer.js';

class Device extends Model {
    deviceId: number;
    manufacturerName: string;
    // Model: string;
    connectStatus: boolean;
    batteryLevel: number;
    maxHz: number;
}

Device.init({
    // Device id should be a mac address, maybe double check if this is correct?
    // deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, validate: { is: /^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$/} },
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    manufacturerName: { type: DataTypes.STRING(100), allowNull: false, references: { model: 'Manufacturer', key: 'manufacturerName' } },
    // Model: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'Model' } },
    connectStatus: { type: DataTypes.BOOLEAN, defaultValue: false},
    batteryLevel: { type: DataTypes.INTEGER, defaultValue: 0},
    maxHz: { type: DataTypes.INTEGER, defaultValue: 0},
},
{
    sequelize,
    modelName: 'Device',
    tableName: 'Device',
    timestamps: false,
});

export default Device;
