// import {Sequelize} from 'sequelize';
// const Sequelize = require('sequelize');
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database/db.sqlite3',
  // Uit commenten als je wilt debuggen
  logging: false,
});

export default sequelize;
