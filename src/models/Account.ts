import { Sequelize, DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize.js';
// const sequelize = require('../database/sequelize.js');

class Account extends Model {
    AccountId: number;
    // ProjectId: number[];
    Enabled: boolean;
    Name: string;
    Password: string;
    Role: string;
    Email: string;
    Meta: object;
    CreatedAt: Date;
    HasChangedPassword: boolean;
    HasAvatar: boolean;
    PinnedProjects: number[];
}

Account.init({
    AccountId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    // ProjectId: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'projectId' } },
    Enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    Password: { type: DataTypes.STRING(50), allowNull: false },
    Meta: { type: DataTypes.JSON, defaultValue: {} },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    HasChangedPassword: { type: DataTypes.BOOLEAN, defaultValue: false },
    Role: { type: DataTypes.STRING, defaultValue: "student", validate: { isIn: [["admin", "student", "teacher", "staff"]] } },
    HasAvatar: { type: DataTypes.BOOLEAN, defaultValue: false },
    // PinnedProjects: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'id' } },
},
{
    sequelize,
    modelName: 'Account',
    tableName: 'Account',
    timestamps: false,
});


// Account.sync({ force: true });
// module.exports = Account;
export default Account;













// module.exports = (sequelize, DataTypes) => {
//     var Account = sequelize.define('Account', {
//         AccountId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
//         Enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
//         Name: { type: DataTypes.STRING(100), allowNull: false },
//         Email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
//         Password: { type: DataTypes.STRING(50), allowNull: false },
//         Meta: { type: DataTypes.JSON, defaultValue: {} },
//         CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
//         HasChangedPassword: { type: DataTypes.BOOLEAN, defaultValue: false },
//         Role: { type: DataTypes.STRING, defaultValue: "student", validate: { isIn: [["admin", "student", "teacher", "staff"]] } },
//         HasAvatar: { type: DataTypes.BOOLEAN, defaultValue: false },
//         // PinnedProjects: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'id' } },
//     },
//     {
//         sequelize,
//         modelName: 'Account',
//         tableName: 'Account',
//     })
//     return Account;
// };

// export default Account;






