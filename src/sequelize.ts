import { Sequelize } from 'sequelize';
import { SQLITE_PATH } from './config.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: SQLITE_PATH,
  // Uit commenten als je wilt debuggen
  logging: false,
});

export default sequelize;
