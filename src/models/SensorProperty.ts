import Sensor from './Sensor';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SensorProperty extends Model {
    PropertyName: string;
    Model: string;
    ManufacturerName: string;
}

SensorProperty.init({
    PropertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    Model: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'Model' } },
    ManufacturerName: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'ManufacturerName' } },
},
{
    sequelize,
    modelName: 'SensorProperty',
    tableName: 'SensorProperty',
    timestamps: false,
});

export default SensorProperty;
