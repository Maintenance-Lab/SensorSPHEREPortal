import SensorProperty from './SensorProperty';
import SensorCategory from './SensorCategory';
import Manufacturer from './Manufacturer';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Sensor extends Model {
    Model : string;
    ManufacturerName : string;
    CategoryName : string;
    PropertyName : string;
}

Sensor.init({
    Model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    ManufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Manufacturer, key: 'ManufacturerName' } },
    CategoryName: { type: DataTypes.STRING, allowNull: false, references: { model: SensorCategory, key: 'CategoryName' }},
    PropertyName:{ type: DataTypes.STRING, allowNull: false, references: { model: SensorProperty, key: 'PropertyName' }},
},
{
    sequelize,
    modelName: 'Sensor',
    tableName: 'Sensor',
    timestamps: false,
});

export default Sensor;
