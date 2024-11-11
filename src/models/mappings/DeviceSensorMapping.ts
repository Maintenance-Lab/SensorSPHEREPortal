import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class DeviceSensorMapping extends Model {
    deviceId: number;
    sensorModel: string;
    manufacturerName: string;
    channel: number;
}

DeviceSensorMapping.init({
    deviceId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'Device', key: 'deviceId' }, allowNull: false },
    sensorModel: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'Sensor', key: 'model'}, allowNull: false},
    manufacturerName: {type: DataTypes.STRING, primaryKey: true, references: { model: 'Manufacturer', key: 'manufacturerName'}, allowNull: false },
    channel: {type: DataTypes.INTEGER, primaryKey: true},
}, {
    sequelize,
    modelName: 'DeviceSensorMapping',
    tableName: 'DeviceSensorMapping',
    timestamps: false,
});

export default DeviceSensorMapping;
