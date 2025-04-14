import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';

class Sensor extends Model {
    categoryName: string;
}

Sensor.init({
    type: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'Sensor',
    tableName: 'Sensor',
    timestamps: false,
});

export default Sensor;
