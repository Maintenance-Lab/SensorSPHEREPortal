import SensorProperty from "./SensorProperty";
import SensorCategory from "./SensorCategory";
import SensorManufacturer from "./SensorManufacturer";

import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class Sensor extends Model {}

Sensor.init({
    Model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    ManufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: SensorManufacturer, key: 'ManufacturerName' } },
    CategoryName: { type: DataTypes.STRING, allowNull: false, references: { model: SensorCategory, key: 'CategoryName' }},
    PropertyName:{ type: DataTypes.STRING, allowNull: false, references: { model: SensorProperty, key: 'PropertyName' }},
},
{
    sequelize,
    modelName: 'SensorModel',
});

export default Sensor;
