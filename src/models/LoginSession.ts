import Account from './Account.js';
import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class LoginSession extends Model {
  LoginSessionId: number;
  Account: number;
  // Is called LoginSessionDate because otherwise the Date() function will be overwritten
  LoginSessionDate: Date;
  UserAgent: string;
  Ip: string;
  Token: string;
}

LoginSession.init({
  LoginSessionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  Account: { type: DataTypes.INTEGER, allowNull: false, references: { model: Account, key: 'AccountId' } },
  LoginSessionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  UserAgent: { type: DataTypes.STRING, allowNull: false },
  Ip: { type: DataTypes.STRING, allowNull: false },
  Token: { type: DataTypes.STRING, allowNull: false },
},
{
  sequelize,
  modelName: 'LoginSession',
  tableName: 'LoginSession',
  timestamps: false,
});

export default LoginSession;
