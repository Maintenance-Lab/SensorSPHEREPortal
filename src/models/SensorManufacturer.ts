import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class SensorManufacturer extends Model {}

SensorManufacturer.init({
    ManufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'SensorManufacturerModel',
});

export default SensorManufacturer;
