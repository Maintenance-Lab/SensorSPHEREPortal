import SensorProperty from './SensorProperty.js';
import SensorCategory from './SensorCategory.js';
import Manufacturer from './Manufacturer.js';

import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Sensor extends Model {
    model : string;
    manufacturerName : string;
    categoryName : string;
}

Sensor.init({
    model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    manufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Manufacturer, key: 'manufacturerName' } },
    // categoryName: { type: DataTypes.STRING, allowNull: false, references: { model: SensorCategory, key: 'categoryName' }},
    categoryName: { type: DataTypes.STRING, references: { model: SensorCategory, key: 'categoryName' }},

},
{
    sequelize,
    modelName: 'Sensor',
    tableName: 'Sensor',
    timestamps: false,
});

export default Sensor;
