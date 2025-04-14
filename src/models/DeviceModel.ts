import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';

class DeviceModel extends Model {
    model: string;
}

DeviceModel.init({
    model: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
},
{
    sequelize,
    modelName: 'DeviceModel',
    tableName: 'DeviceModel',
    timestamps: false,
});

export default DeviceModel;