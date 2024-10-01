import Account from "./Account";
import { Sequelize, DataTypes, Model } from 'sequelize'
const sequelize = new Sequelize('sqlite::memory:');

class LoginSession extends Model {}

LoginSession.init({
  LoginSessionId: { type: DataTypes.STRING, primaryKey: true, allowNull: false },
  Account: { type: DataTypes.STRING, allowNull: false, references: { model: Account, key: 'AccountId' } },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  userAgent: { type: DataTypes.STRING, allowNull: false },
  ip: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING, allowNull: false },
},
{
  sequelize,
  modelName: 'LoginSessionModel',
});

export default LoginSession;
