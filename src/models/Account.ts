import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';

class Account extends Model {
    accountId: number;
    // ProjectId: number[];
    enabled: boolean;
    name: string;
    password: string;
    role: string;
    email: string;
    meta: object;
    createdAt: Date;
    hasChangedPassword: boolean;
    hasAvatar: boolean;
}

Account.init({
    accountId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    // ProjectId: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'projectId' } },
    enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(50), allowNull: false },
    meta: { type: DataTypes.JSON, defaultValue: {} },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    hasChangedPassword: { type: DataTypes.BOOLEAN, defaultValue: false },
    role: { type: DataTypes.STRING, defaultValue: "student", validate: { isIn: [["admin", "student", "teacher", "staff"]] } },
    hasAvatar: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'Account',
    tableName: 'Account',
    timestamps: false,
});

export default Account;
