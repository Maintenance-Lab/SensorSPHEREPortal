import Account from "./Account";
import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class LoginSession extends Model {
  LoginSessionId: string;
  Account: number;
  // Is called LoginSessionDate because otherwise the Date() function will be overwritten
  LoginSessionDate: Date;
  UserAgent: string;
  Ip: string;
  Token: string;
}

LoginSession.init({
  LoginSessionId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  Account: { type: DataTypes.INTEGER, allowNull: false, references: { model: Account, key: 'AccountId' } },
  LoginSessionDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  UserAgent: { type: DataTypes.STRING, allowNull: false },
  Ip: { type: DataTypes.STRING, allowNull: false },
  Token: { type: DataTypes.STRING, allowNull: false },
},
{
  sequelize,
  modelName: 'LoginSessionModel',
});

export default LoginSession;
