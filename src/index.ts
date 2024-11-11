import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
// import dbConnect from "./mongo.js";
import { initDb, closeDb, startDb } from './sqlite.js';
import db from './sequelize.js'
// import setupRelations from './relationships/relationships.js';


const ws = new WebServer();

initDb();
startDb();

cleanup(() => {
  ws.close();
  // closeDb(db);
  db.close();
});
