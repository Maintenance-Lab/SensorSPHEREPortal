import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class Project extends Model {
    ProjectId: number;
    Name: string;
    Description: string;
    Meta: object;
    // Owner: number[];
    CreatedAt: Date;
    // SessionId: number[];
    LastActive: Date;
    Archived: boolean;
}

Project.init({
    ProjectId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    Name: { type: DataTypes.STRING(100), allowNull: false },
    Description: { type: DataTypes.STRING(1000)},
    Meta: { type: DataTypes.JSON, defaultValue: {} },
    CreatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    // SessionId: { type: DataTypes.ARRAY(DataTypes.INTEGER), references: { model: Session, key: 'SessionId' } },
    LastActive: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    Archived: { type: DataTypes.BOOLEAN, defaultValue: false },
},
{
    sequelize,
    modelName: 'Project',
    tableName: 'Project',
    timestamps: false,
});

export default Project;
