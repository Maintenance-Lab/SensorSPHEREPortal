import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class Manufacturer extends Model {
    ManufacturerName: string;
}

Manufacturer.init({
    ManufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'ManufacturerModel',
});

export default Manufacturer;
