import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
import Manufacturer from './Manufacturer.js';

class Device extends Model {
    deviceId: string;
    manufacturerName: string;
    // Model: string;
    connectStatus: string;
    batteryLevel: number;
    maxHz: number;
}

Device.init({
    deviceId: { type: DataTypes.STRING, primaryKey: true, references: { model: 'Device', key: 'deviceId' },  allowNull: false, validate: { is: /^([0-9A-F][0-9A-F]:){5}([0-9A-F][0-9A-F])$/i } },
    manufacturerName: { type: DataTypes.STRING(100), allowNull: false, references: { model: 'Manufacturer', key: 'manufacturerName' } },
    // Model: { type: DataTypes.STRING(100), allowNull: false, references: { model: Sensor, key: 'Model' } },
    connectStatus: { type: DataTypes.STRING, defaultValue: false,  validate: { isIn: [["connected", "disconnected"]] }},
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
