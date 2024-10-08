import { Sequelize, DataTypes, Model } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

class AccountProjectMapping extends Model {
    AccountId: number;
    ProjectId: number;
}

AccountProjectMapping.init({
    AccountId: { type: DataTypes.INTEGER, references: { model: 'Accounts', key: 'AccountId' }, allowNull: false },
    ProjectId: { type: DataTypes.INTEGER, references: { model: 'Projects', key: 'ProjectId' }, allowNull: false },
}, {
    sequelize,
    modelName: 'AccountProject',
});

export default AccountProjectMapping;
