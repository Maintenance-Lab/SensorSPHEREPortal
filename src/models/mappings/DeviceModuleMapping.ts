import { DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';

import Device from '../Device.js';
import Module from '../Module.js';

class DeviceModuleMapping extends Model {
    deviceId: number;
    moduleName: string;
    moduleManufacturer: string;
    sensorType: string;
}

DeviceModuleMapping.init({
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: Device, key: 'deviceId' }, allowNull: false },
    moduleName: { type: DataTypes.STRING, primaryKey: true, references: { model: Module, key: 'name' }, allowNull: false },
    moduleManufacturer: { type: DataTypes.STRING, primaryKey: true, references: { model: Module, key: 'manufacturer' }, allowNull: false },
    sensorType: { type: DataTypes.STRING, primaryKey: true, references: { model: Module, key: 'sensorType' }, allowNull: false },
}, {
    sequelize,
    modelName: 'DeviceModuleMapping',
    tableName: 'DeviceModuleMapping',
    timestamps: false,
});

export default DeviceModuleMapping;
