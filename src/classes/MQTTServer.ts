import mqtt from 'mqtt';
import { MQTT_URI } from '../config.js';

// Example discover message we might receive
// {
//     "MAC": "<MAC-ADDRESS>",
//     "connected": [
//       {
//         "unit": "ENV3",
//         "variables": ["t", "hu", "te"]
//       },
//       {
//         "unit": "IMU",
//         "variables": ["accX", "accY", "accZ", "gyroX", "gyroY", "gyroZ", "temp"]
//       },
//       ...
//     ]
//   }

// Example Configuration message we can use to configure a device
// This is to topic data/<MAC-ADDRESS>/cfg
// {
//     "read": [
//       {
//         "unit": "ENV3",
//         "variables": ["t", "hu"]
//       },
//       {
//         "unit": "IMU",
//         "variables": ["accX", "accY", "accZ", "temp"]
//       },
//       ...
//     ]
//   }

export class MQTTServer {
  private client: mqtt.MqttClient;

  constructor() {
    this.client = mqtt.connect(MQTT_URI);
    this.client.on("connect", () => {
      console.log("MQTT connected");
    });

    this.client.on("error", (error) => {
      console.error("MQTT error", error);
    });

    this.client.on("message", (topic, message) => {
      console.log(`MQTT message received: ${topic} ${message}`);
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
