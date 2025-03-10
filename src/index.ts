import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
import { initDb, startDb } from './sqlite.js';
import db from './sequelize.js'
import { MQTTServer } from './classes/MQTTServer.js';

const ws = new WebServer();
const mqtt = new MQTTServer();

initDb();
startDb();

// mqtt.subscribe('data/+/msg');
// mqtt.subscribe('data/+/cfg');
// mqtt.subscribe('data/+/announce');
// mqtt.subscribe('data/+/heartbeat');
// console.log("Subscribed to data/+/msg and data/+/cfg");

mqtt.subscribe('interface/#');

export default mqtt;

cleanup(() => {
  ws.close();
  db.close();
});
