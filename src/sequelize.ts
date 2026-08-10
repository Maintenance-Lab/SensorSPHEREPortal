import { Sequelize } from 'sequelize';
import sqlite3 from './sqlite3-compat.js';
import { SQLITE_PATH } from './config.js';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: SQLITE_PATH,
  dialectModule: sqlite3,
  // Uit commenten als je wilt debuggen
  logging: false,
});

export default sequelize;
