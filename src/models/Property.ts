import { Sequelize, DataTypes, Model } from 'sequelize'
import Sensor from './Sensor.js';
import sequelize from '../sequelize.js';

class Property extends Model {
    name: string;
    sensorType: string;
    moduleName: string;
    moduleManufacturer: string;
    unit: string;
    accuracy: number;
    rangeMin: number;
    rangeMax: number;
}

Property.init({
    name: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    sensorType: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Sensor, key: 'type' } },
    moduleName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    moduleManufacturer: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    unit: { type: DataTypes.STRING, allowNull: false },
    accuracy: { type: DataTypes.FLOAT, allowNull: false },
    rangeMin: { type: DataTypes.FLOAT, allowNull: false },
    rangeMax: { type: DataTypes.FLOAT, allowNull: false },
},
{
    sequelize,
    modelName: 'Property',
    tableName: 'Property',
    timestamps: false,
});

export default Property;
