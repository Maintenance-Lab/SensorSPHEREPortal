import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
import Manufacturer from './Manufacturer.js';
import Sensor from './Sensor.js';

class Module extends Model {
    model: string;
    manufacturer: string;
    sensorType: string;
}

Module.init({
    name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    manufacturer: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Manufacturer, key: 'manufacturer' } },
    sensorType: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Sensor, key: 'type' } },
},
{
    sequelize,
    modelName: 'Module',
    tableName: 'Module',
    timestamps: false,
});

export default Module;
