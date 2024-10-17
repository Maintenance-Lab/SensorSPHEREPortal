import Sensor from './Sensor';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SensorProperty extends Model {
    propertyName: string;
    model: string;
    manufacturerName: string;
}

SensorProperty.init({
    propertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'Model' } },
    manufacturerName: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'ManufacturerName' } },
},
{
    sequelize,
    modelName: 'SensorProperty',
    tableName: 'SensorProperty',
    timestamps: false,
});

export default SensorProperty;
