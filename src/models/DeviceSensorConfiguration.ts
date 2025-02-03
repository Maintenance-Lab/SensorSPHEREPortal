import SessionDeviceMapping from './mappings/SessionDeviceMapping.js';
import SensorProperty from './SensorProperty.js';
import sequelize from '../sequelize.js';

import { Sequelize, DataTypes, Model } from 'sequelize'

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
    model: { type: DataTypes.STRING, allowNull: false, primaryKey: true, references: { model: SensorProperty, key: 'model' } },
    manufacturerName: { type: DataTypes.STRING, allowNull: false, primaryKey: true, references: { model: SensorProperty, key: 'manufacturerName' } },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
},
{
    sequelize,
    modelName: 'DeviceSensorConfiguration',
    tableName: 'DeviceSensorConfiguration',
    timestamps: false,
});

export default DeviceSensorConfiguration;
