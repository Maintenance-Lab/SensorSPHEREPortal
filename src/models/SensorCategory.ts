import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class SensorCategory extends Model {
    categoryName: string;
}

SensorCategory.init({
    categoryName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'SensorCategory',
    tableName: 'SensorCategory',
    timestamps: false,
});

export default SensorCategory;
