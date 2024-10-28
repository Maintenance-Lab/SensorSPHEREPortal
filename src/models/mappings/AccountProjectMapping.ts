import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class AccountProjectMapping extends Model {
    accountId: number;
    projectId: number;
}

AccountProjectMapping.init({
    accountId: { type: DataTypes.INTEGER, references: { model: 'Account', key: 'accountId' }, allowNull: false },
    projectId: { type: DataTypes.INTEGER, references: { model: 'Projects', key: 'projectId' }, allowNull: false },
}, {
    sequelize,
    modelName: 'AccountProjectMapping',
    tableName: 'AccountProjectMapping',
    timestamps: false,
});

export default AccountProjectMapping;
