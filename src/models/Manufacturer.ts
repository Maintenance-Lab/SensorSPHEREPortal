import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Manufacturer extends Model {
    ManufacturerName: string;
}

Manufacturer.init({
    ManufacturerName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'Manufacturer',
    tableName: 'Manufacturer',
    timestamps: false,
});

export default Manufacturer;
