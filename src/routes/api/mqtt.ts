import e, { Router } from 'express';
import { MQTTServer } from '../../classes/MQTTServer.js';
import { MAC_ADDRESS } from '../../config.js';
import Device from '../../models/Device.js';
// import { mqttEvents } from '../../classes/MQTTServer.js';
import Manufacturer from '../../models/Manufacturer.js';
import mqtt from '../../index.js';

const router = Router();
// const mqtt = new MQTTServer();
// console.log("mqtt created: ", mqtt);

router.post("/publish", async (req, res) => {
    console.log("in /publish/message: ", req.body);
    const { id, postfix, message } = req.body;

    const device = await Device.findByPk(id);
    if (!device) return res.status(404).json({ error: "Device not found" });
    const topic = 'data/' + device.deviceId + '/' + postfix;
    mqtt.publish(topic, message);

    return res.json({ message: "Message published" });
});

// router.get("/devices", async (_, res) => {
//     console.log("IN DEVICES API");

//     mqttEvents.on("message", async (topic, message) => {
//         console.log("message: ", message.toString());
//         const messageString = message.toString();

//         const deviceId = topic.split("/")[1];
//         const messageJSON = JSON.parse(messageString);

//         // if manufacturer not in database, add it
//         const manufacturer = await Manufacturer.findOne({ where: { manufacturerName: messageJSON.manufacturerName } });
//         if (!manufacturer) {
//             try {
//                 const doc = await Manufacturer.create({ manufacturerName: messageJSON.manufacturerName });

//                 if (!doc) return res.status(500).json({ error: "Error creating manufacturer" });
//                 console.log("Manufacturer created: ", doc);
//             }
//             catch (error) {
//                 console.log("Error creating manufacturer: ", error);
//             }
//             return res.json({ message: "Manufacturer created" });
//         }

//         // Add device to database if it does not exist
//         const device = await Device.findOne({ where: { deviceId } });
//         if (!device) {
//             console.log("Device does not exist, creating device");
//             console.log("messageJSON: ", messageJSON);
//             try {
//                 const doc = await Device.create(messageJSON);
//                 // const doc = await Device.create({deviceId: 50, manufacturerName: messageJSON.manufacturerName, connectStatus: connectStatus, batteryLevel: batteryLevel, maxHz: maxHz});

//                 if (!doc) return res.status(500).json({ error: "Error creating device" });
//                 console.log("Device created: ", doc);
//             }
//             catch (error) {
//                 console.log("Error creating device: ", error);
//             }

//             return res.json({ message: "Device created" });
//         }

//         return res.json({ message: "Device already exists" });
//     });
// });

export default router;
