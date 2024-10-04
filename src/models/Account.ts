import Project from "./Project";

import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class Account extends Model {
    AccountId: number;
    ProjectId: number[];
    Enabled: boolean;
    Name: string;
    Email: string;
    Password: string;
    Meta: object;
    CreatedAt: Date;
    HasChangedPassword: boolean;
    Role: string;
    HasAvatar: boolean;
    PinnedProjects: number[];
}

Account.init({
    AccountId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    ProjectId: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'projectId' } },
    Enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Email: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    Password: { type: DataTypes.STRING(50), allowNull: false },
    Meta: { type: DataTypes.JSON, defaultValue: {} },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    HasChangedPassword: { type: DataTypes.BOOLEAN, defaultValue: false },
    Role: { type: DataTypes.STRING, defaultValue: "student", validate: { isIn: [["administrator", "student", "teacher", "staff"]] } },
    HasAvatar: { type: DataTypes.BOOLEAN, defaultValue: false },
    PinnedProjects: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Project, key: 'id' } },
},
{
    sequelize,
    modelName: 'AccountModel',
});

export default Project;
