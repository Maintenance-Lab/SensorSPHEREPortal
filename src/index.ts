import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
import { initDb, startDb } from './sqlite.js';
import db from './sequelize.js'
import { MQTTServer } from './classes/MQTTServer.js';

const ws = new WebServer();
const mqtt = new MQTTServer();

initDb();
startDb();

mqtt.subscribe('interface/listUnitsResult');
mqtt.subscribe('interface/+/validateConfigurationResult');
console.log("Subscribed to interface/listUnitsResult and interface/<mac_addr>/validateConfigurationResult");

// Subscribed to check
// Subscribe to all topics starting with 'interface/'
mqtt.subscribe('interface/+');

export default mqtt;

cleanup(() => {
  ws.close();
  db.close();
});
