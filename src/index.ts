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
mqtt.subscribe('interface/+/handshake');
console.log("Subscribed to interface/listUnitsResult, interface/<mac_addr>/validateConfigurationResult and interface/<mac_addr>/handshake topics");

// Subscribed for testing
mqtt.subscribe('interface/+');

export default mqtt;

cleanup(() => {
  ws.close();
  db.close();
});
