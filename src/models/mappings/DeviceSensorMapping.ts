import { Sequelize, DataTypes, Model } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

class DeviceSensorMapping extends Model {
    DeviceId: number;
    SensorModel: string;
    ManufacturerName: string;
    Channel: number;
}

DeviceSensorMapping.init({
    Channel: {type: DataTypes.INTEGER, primaryKey: true},
    DeviceId: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'Device', key: 'DeviceId' }, allowNull: false },
    SensorModel: { type: DataTypes.INTEGER, primaryKey: true, references: { model: 'Sensor', key: 'Model'}, allowNull: false},
    ManufacturerName: {type: DataTypes.STRING, primaryKey: true, references: { model: 'Manufacturer', key: 'ManufacturerName'}, allowNull: false }, 
}, {
    sequelize,
    modelName: 'DeviceSensorMapping',
});

export default DeviceSensorMapping;
