import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
import { initDb, startDb } from './sqlite.js';
import db from './sequelize.js'
import { MQTTServer } from './classes/MQTTServer.js';

const ws = new WebServer();
const mqtt = new MQTTServer();

initDb();
startDb();

mqtt.subscribe('data/+/msg');
mqtt.subscribe('data/+/cfg');
console.log("Subscribed to data/+/msg and data/+/cfg");

export default mqtt;

cleanup(() => {
  ws.close();
  db.close();
});
