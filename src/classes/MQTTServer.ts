import mqtt from 'mqtt';
import { MQTT_URI } from '../config.js';
import { EventEmitter } from 'events';
import Device from '../models/Device.js';
import Manufacturer from '../models/Manufacturer.js';
import { MQTTMessage } from '../services/Mqtt.js';
import { backgroundHeartBeatStart } from '../services/Heartbeat.js';

// export const mqttEvents = new EventEmitter();

// const addDeviceData = async (topic: string, message: Buffer) => {
//     console.log("IN DEVICES API");

//     console.log("message: ", message.toString());
//     const messageString = message.toString();

//     const deviceId = topic.split("/")[1];
//     const messageJSON = JSON.parse(messageString);

//     // if manufacturer not in database, add it
//     const manufacturer = await Manufacturer.findOne({ where: { manufacturerName: messageJSON.manufacturerName } });
//     if (!manufacturer) {
//         try {
//             const doc = await Manufacturer.create({ manufacturerName: messageJSON.manufacturerName });
//             console.log("Manufacturer created: ", doc);
//         }
//         catch (error) {
//             console.log("Error creating manufacturer: ", error);
//         }
//     }

//     // Add device to database if device does not exist
//     const device = await Device.findOne({ where: { deviceId } });
//     if (!device) {
//         console.log("Device does not exist, creating device");
//         console.log("messageJSON: ", messageJSON);
//         try {
//             const doc = await Device.create(messageJSON);
//             console.log("Device created: ", doc);
//         }
//         catch (error) {
//             console.log("Error creating device: ", error);
//         }
//     }
// }

export class MQTTServer {
  private client: mqtt.MqttClient;

  heartBeatId = backgroundHeartBeatStart()

  constructor() {
    console.log("MQTT_URI", MQTT_URI);
    this.client = mqtt.connect(MQTT_URI);
    this.client.on("connect", () => {
      console.log("MQTT connected");
    });

    this.client.on("error", (error) => {
      console.error("MQTT error", error);
    });

    this.client.on("message", (topic, message) => {
      console.log(`MQTT message received: ${topic} ${message}`);
      MQTTMessage(topic, message);
      // addDeviceData(topic, message);
      // mqttEvents.emit("message", topic, message);
    });
  }

  subscribe(topic: string) {
    this.client.subscribe(topic);
  }

  publish(topic: string, message: string) {
    this.client.publish(topic, message);
  }

  end() {
    this.client.end();
  }

  onMessage(callback: (topic: string, message: Buffer) => void) {
    this.client.on("message", callback);
  }

  configureDevice(mac: string, config: any) {
    this.publish(`data/${mac}/cfg`, JSON.stringify(config));
  }
}
