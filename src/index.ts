import cleanup from 'node-cleanup';
import WebServer from './classes/WebServer.js';
import { initDb, startDb, createDefaultUser } from './sqlite.js';
import db from './sequelize.js'
import { MQTTServer } from './classes/MQTTServer.js';

const ws = new WebServer();
const mqtt = new MQTTServer();

initDb();
startDb();
createDefaultUser();

mqtt.subscribe('interface/listUnitsResult');
mqtt.subscribe('interface/validateConfigurationResult');
mqtt.subscribe('interface/handshake/requestStatus');
console.log("Subscribed to interface/listUnitsResult, interface/validateConfigurationResult and interface/handshake/requestStatus topics");

// Subscribed for testing
// mqtt.subscribe('interface/#');

export default mqtt;

cleanup(() => {
  ws.close();
  db.close();
});
