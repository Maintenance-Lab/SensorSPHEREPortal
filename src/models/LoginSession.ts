import Account from './Account.js';
import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../sequelize.js';
// const sequelize = new Sequelize({dialect: 'sqlite', storage: ':memory:'});

class LoginSession extends Model {
  loginSessionId: number;
  account: number;
  // Is called LoginSessionDate because otherwise the Date() function will be overwritten
  loginSessionDate: Date;
  userAgent: string;
  ip: string;
  token: string;
}

LoginSession.init({
  loginSessionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  account: { type: DataTypes.INTEGER, allowNull: false, references: { model: Account, key: 'accountId' } },
  loginSessionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  userAgent: { type: DataTypes.STRING, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
},
{
  sequelize,
  modelName: 'LoginSession',
  tableName: 'LoginSession',
  timestamps: false,
});

export default LoginSession;
