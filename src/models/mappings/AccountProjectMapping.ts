import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class AccountProjectMapping extends Model {
    AccountId: number;
    ProjectId: number;
}

AccountProjectMapping.init({
    AccountId: { type: DataTypes.INTEGER, references: { model: 'Account', key: 'AccountId' }, allowNull: false },
    ProjectId: { type: DataTypes.INTEGER, references: { model: 'Projects', key: 'ProjectId' }, allowNull: false },
}, {
    sequelize,
    modelName: 'AccountProject',
    tableName: 'AccountProject',
    timestamps: false,
});

export default AccountProjectMapping;
