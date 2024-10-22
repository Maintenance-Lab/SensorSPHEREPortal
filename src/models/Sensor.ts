import SensorProperty from './SensorProperty';
import SensorCategory from './SensorCategory.js';
import Manufacturer from './Manufacturer.js';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Sensor extends Model {
    model : string;
    manufacturerName : string;
    categoryName : string;
    // propertyName : string;
}

Sensor.init({
    model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    manufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Manufacturer, key: 'ManufacturerName' } },
    categoryName: { type: DataTypes.STRING, allowNull: false, references: { model: SensorCategory, key: 'CategoryName' }},
    // propertyName:{ type: DataTypes.STRING, allowNull: false, references: { model: SensorProperty, key: 'PropertyName' }},
},
{
    sequelize,
    modelName: 'Sensor',
    tableName: 'Sensor',
    timestamps: false,
});

export default Sensor;
