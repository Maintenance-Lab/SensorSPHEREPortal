import { Sequelize, DataTypes, Model } from 'sequelize'
import Sensor from './Sensor.js';
import sequelize from '../sequelize.js';
import Manufacturer from './Manufacturer.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SensorProperty extends Model {
    propertyName: string;
    model: string;
    manufacturerName: string;
}

SensorProperty.init({
    propertyName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    model: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Sensor, key: 'model' } },
    // model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
    // manufacturerName: { type: DataTypes.STRING, allowNull: false, references: { model: Manufacturer, key: 'manufacturerName' } },
    manufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false, references: { model: Sensor, key: 'manufacturerName' } },
    // manufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false }
},
{
    sequelize,
    modelName: 'SensorProperty',
    tableName: 'SensorProperty',
    timestamps: false,
});

export default SensorProperty;
