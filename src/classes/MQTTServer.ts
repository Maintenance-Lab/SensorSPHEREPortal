import mqtt from 'mqtt';
import { MQTT_URI } from '../config.js';
import Device from '../models/Device.js';
import Manufacturer from '../models/Manufacturer.js';
import { MQTTMessage } from '../services/mqtt.js';

export class MQTTServer {
  private client: mqtt.MqttClient;

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
      const shown =
        message.length > 120 ? message.toString().slice(0, 120) + "..." : message.toString();
      console.log(`MQTT message received: ${topic} [${message.length} bytes] ${shown}`);
      MQTTMessage(topic, message).catch((error) => {
        console.error("Unhandled error in MQTTMessage:", error);
      });
    });
  }

  subscribe(topic: string) {
    this.client.subscribe(topic);
  }

  publish(topic: string, message: string, options?: any) {
    // this.client.publish(topic, message);
    this.client.publish(topic, message, options);
  }

  end() {
    this.client.end();
  }

  onMessage(callback: (topic: string, message: Buffer) => void) {
    this.client.on("message", callback);
  }
}
