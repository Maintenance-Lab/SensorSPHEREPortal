import { DataTypes, Model } from 'sequelize';
import sequelize from '../../sequelize.js';

import Account from '../Account.js';
import Project from '../Project.js';

class AccountProjectMapping extends Model {
    accountId: number;
    projectId: number;
    status: string;
}

AccountProjectMapping.init({
    accountId: { type: DataTypes.INTEGER, references: { model: Account, key: 'accountId' }, primaryKey: true, allowNull: false },
    projectId: { type: DataTypes.INTEGER, references: { model: Project, key: 'projectId' }, primaryKey: true, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'active', validate: { isIn: [['active', 'archived', 'pending']] } },
}, {
    sequelize,
    modelName: 'AccountProjectMapping',
    tableName: 'AccountProjectMapping',
    timestamps: false,
});

export default AccountProjectMapping;
