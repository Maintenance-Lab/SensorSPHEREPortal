import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
import { initDb, startDb } from './sqlite.js';
import db from './sequelize.js'

const ws = new WebServer();

initDb();
startDb();

cleanup(() => {
  ws.close();
  db.close();
});
