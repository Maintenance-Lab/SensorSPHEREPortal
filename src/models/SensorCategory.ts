import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class SensorCategory extends Model {}

SensorCategory.init({
    CategoryName: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'SensorCategoryModel',
});

export default SensorCategory;
