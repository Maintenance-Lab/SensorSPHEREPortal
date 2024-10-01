import Sensor from "./Sensor";

import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class SensorProperty extends Model {}

SensorProperty.init({
    PropertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    Model: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'Model' } },
    ManufacturerName: { type: DataTypes.STRING, allowNull: false, references: { model: Sensor, key: 'ManufacturerName' } },
},
{
    sequelize,
    modelName: 'SensorPropertyModel',
});

export default SensorProperty;
