import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';

class Manufacturer extends Model {
    manufacturer: string;
}

Manufacturer.init({
    manufacturer: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'Manufacturer',
    tableName: 'Manufacturer',
    timestamps: false,
});

export default Manufacturer;
