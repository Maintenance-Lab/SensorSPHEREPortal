import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';

import Manufacturer from './Manufacturer.js';
import DeviceModel from './DeviceModel.js';


class Device extends Model {
    deviceId: string;
    manufacturer: string;
    model: string;
    connectStatus: string;
    batteryLevel: number;
    sampleRate: number;
    lastHeartbeat: Date;
}

Device.init({
    deviceId: { type: DataTypes.STRING, primaryKey: true,  allowNull: false, validate: { is: /^([0-9A-F][0-9A-F]:){5}([0-9A-F][0-9A-F])$/i } },
    manufacturer: { type: DataTypes.STRING(100), allowNull: false,  references: { model: Manufacturer, key: 'manufacturer' } },
    model: { type: DataTypes.STRING(100), allowNull: false, references: { model: DeviceModel, key: 'model' } },
    connectStatus: { type: DataTypes.STRING, defaultValue: "connected", validate: { isIn: [["connected", "disconnected", "online"]] }},
    batteryLevel: { type: DataTypes.INTEGER, defaultValue: 0},
    sampleRate: { type: DataTypes.INTEGER, defaultValue: 0},
    lastHeartbeat: { type: DataTypes.DATE, defaultValue: new Date() }
},
{
    sequelize,
    modelName: 'Device',
    tableName: 'Device',
    timestamps: false,
});

export default Device;
