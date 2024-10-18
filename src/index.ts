import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
// import dbConnect from "./mongo.js";
import { initDb, closeDb, startDb } from './sqlite.js';
import db from './sequelize.js'


const ws = new WebServer();
// const db = require('./sqlite.js');


// const db = initDb();
initDb();
startDb();


cleanup(() => {
  ws.close();
  // closeDb(db);
  db.close();
});
