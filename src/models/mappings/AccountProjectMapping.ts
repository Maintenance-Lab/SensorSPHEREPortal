import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class AccountProjectMapping extends Model {
    accountId: number;
    projectId: number;
    status: string;
}

AccountProjectMapping.init({
    accountId: { type: DataTypes.INTEGER, references: { model: 'Account', key: 'accountId' }, primaryKey: true, allowNull: false },
    projectId: { type: DataTypes.INTEGER, references: { model: 'Projects', key: 'projectId' }, primaryKey: true, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'archived', 'pending']] } },
}, {
    sequelize,
    modelName: 'AccountProjectMapping',
    tableName: 'AccountProjectMapping',
    timestamps: false,
});

export default AccountProjectMapping;
