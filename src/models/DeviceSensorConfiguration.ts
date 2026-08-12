import SessionDeviceMapping from './mappings/SessionDeviceMapping.js';
import sequelize from '../sequelize.js';

import { DataTypes, Model } from 'sequelize'

class DeviceSensorConfiguration extends Model {
    sessionId: number;
    deviceId: number;
    sensorProperty: string;
    sensorType: string;
    active: boolean;
}

DeviceSensorConfiguration.init({
    sessionId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: SessionDeviceMapping, key: 'sessionId' } },
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false, references: { model: SessionDeviceMapping, key: 'deviceId' } },
    sensorProperty: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    sensorType: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
},
{
    sequelize,
    modelName: 'DeviceSensorConfiguration',
    tableName: 'DeviceSensorConfiguration',
    timestamps: false,
});

export default DeviceSensorConfiguration;
