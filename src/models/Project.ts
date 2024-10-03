import Account from "./Account";
import Session from "./Session";

import { Sequelize, DataTypes, Model } from 'sequelize';
const sequelize = new Sequelize('sqlite::memory:');

class Project extends Model {
    ProjectId: number;
    Name: string;
    Description: string;
    Meta: object;
    Owner: number[];
    CreatedAt: Date;
    SessionId: number[];
    LastActive: Date;
    Archived: boolean;
}

Project.init({
    ProjectId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Description: { type: DataTypes.STRING(1000)},
    Meta: { type: DataTypes.JSON, defaultValue: {} },
    Owner: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Account, key: 'AccountId' } },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    SessionId: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Session, key: 'SessionId' } },
    LastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    Archived: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'ProjectModel',
});

export default Project;
