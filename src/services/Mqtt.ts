import Manufacturer from "../models/Manufacturer.js";
import Property from "../models/Property.js";
import DeviceModuleMapping from "../models/mappings/DeviceModuleMapping.js";
import Device from "../models/Device.js";
import Module from "../models/Module.js";
import DeviceModel from "../models/DeviceModel.js";
import Sensor from "../models/Sensor.js";
import WebSocket from 'ws';
import mqtt from '../index.js';

// Set up WebSocket server
export const wss = new WebSocket.Server({ port: 8080 });

export const MQTTMessage = async (topic: string, message: Buffer) => {
    return new Promise(async (resolve, _) => {
        const topicParts = topic.split("/");
        const parsed_message = JSON.parse(message.toString());

        if (topic == "interface/listUnitsResult") {
            console.log("Got message on listUnitsResult topic");
            updateDeviceStatus(parsed_message);
        }
        else if (topic == "interface/handshake/requestStatus") {
            console.log("Got message on handshake topic");
            console.log(parsed_message);
            console.log("Sending handshake response");
            const deviceId = parsed_message.mac
            // Send handshake response
            const message_out = {
                "requestStatusResult": "test",
                "mac": deviceId
            }
            const options = { qos: 2 };
            mqtt.publish("interface/handshake/requestStatusResult", JSON.stringify(message_out), options);
            console.log("Adding device to database");
            addDeviceToDatabase(message);
        }
        else if (topicParts[0] == "interface" && topicParts[2] == "validateConfigurationResult") {
            sendSampleRate(parsed_message);
        }
        else {
            console.log("MQTT topic not implemented");
        }

        return resolve({ message: "Message received" });
    });
}


const sendSampleRate= async (message: any) => {
    return new Promise(async (resolve, _) => {
        const deviceId = message.mac;
        const sampleRate = message.sampleRate;

        console.log("In send sample rate: ", sampleRate, deviceId);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ event: "sampleRate", sampleRate: sampleRate, deviceId: deviceId }));
            }
        });

        return resolve({ message: "Sample rate sent" });
    });
}


const addNewEntryToTable = async (table: any, entry: any) => {
    return new Promise(async (resolve, reject) => {
        console.log("In add new entry to table: ", table, entry);

        let entryPK: any = {};
        for (const attribute of table.primaryKeyAttributes) {
            entryPK[attribute] = entry[attribute];
        }
        console.log("entryPK: ", entryPK);

        let existingEntry;
        try {
            existingEntry = await table.findOne({ where: entryPK });
            console.log("existing entry: ", existingEntry);
        }
        catch(error) {
            console.log("dit is de error:", error)
        }

        if (!existingEntry) {
            try{
                const doc = await table.create( entry );
                if (!doc) return reject(new Error("Error creating entry"));
            }
            catch(error) {
                console.log("dit is de error 2:", error)
            }
        }

        return resolve({ message: "Entry created" });
    });
}


const addOrUpdateDevice = async (entry: any) => {
    return new Promise(async (resolve, reject) => {
        console.log("In add or update device: ", entry);

        const existingDevice = await Device.findOne({ where: { deviceId: entry["deviceId"] } });

        if (existingDevice) {
            console.log("Device exists, updating device");
            const doc = await Device.update(entry, { where: { deviceId: entry["deviceId"] } });
            if (!doc) return reject(new Error("Error updating entry"));
        }
        else {
            let doc;
            try {
                await addNewEntryToTable(Manufacturer, { manufacturer: entry.manufacturer })
                await addNewEntryToTable(DeviceModel, { model: entry.model})
                doc = await Device.create( entry );
            }
            catch(error) {
                console.log("dit is de error 3:", error)
            }
            // const doc = await Device.create( entry );
            if (!doc) return reject(new Error("Error creating entry"));
        }

        return resolve({ message: "Entry created or updated" });
    });
}



const addDeviceToDatabase = async (message: any) => {
    return new Promise(async (resolve, _) => {
        // Loop through all units in message
        const deviceId = message.mac;

            // Add device to database if device does not exist
            await addOrUpdateDevice({ deviceId: deviceId, manufacturer: message.manufacturer, model: message.model, batteryLevel: message.batteryLevel })

            // If sensor module manufacturer does not exist, add it to database
            for (const module of message.sensorModules) {
                await addNewEntryToTable(Manufacturer, { manufacturer: module.manufacturer })


                // TODO:: UPDATE WITH PAYLOAD
                // If sensor type does not exist, add it to database
                try {
                    for (const sensor of module.sensors) {
                        await addNewEntryToTable(Sensor, { type: sensor.sensorType })
                        console.log("manufacturer !!!!!!!!!!!!!!!!!!!!!!! ", module.manufacturer);
                        await addNewEntryToTable(Module, { name: module.moduleName, manufacturer: module.manufacturer, sensorType: sensor.sensorType })

                        // Add deviceModuleMapping to database if it does not exist
                        await addNewEntryToTable(DeviceModuleMapping, { deviceId: deviceId, moduleName: module.moduleName, moduleManufacturer: module.manufacturer, sensorType: sensor.sensorType })

                        for (const measurement of sensor.measurements) {
                            // Parse range [min, max] to rangeMin and rangeMax
                            const rangeMin = measurement.range[0];
                            const rangeMax = measurement.range[1];

                            // Accuracy is "±0.05", needs to be float
                            const accuracy = parseFloat(measurement.accuracy.replace("±", "").replace(",", ".").trim());
                            console.log("new accuracy: ", accuracy);
                            await addNewEntryToTable(Property, { name: measurement.type , sensorType: sensor.sensorType, unit: measurement.unit, accuracy: accuracy, rangeMin: rangeMin, rangeMax: rangeMax })
                        }
                    }
                } catch (e) {
                    console.log("Error parsing handshake payload: ", e);
                }
            }

            // // If sensor category or manufacturer does not exist, add it to database
            // // Then add sensor to database
            // for (const sensor of unit.sensorModules) {

            //     await addNewEntryToTable(Manufacturer, { manufacturer: sensor.manufacturer })
            //     await addNewEntryToTable(Sensor, { model: sensor.moduleName, manufacturer: sensor.manufacturer })


            //     // Add device sensor mapping to database if it does not exist
            //     await addNewEntryToTable(DeviceModuleMapping, { deviceId: deviceId, model: sensor.moduleName, manufacturer: sensor.manufacturer, channel: sensor.channel })

            //     // Add sensor properties to database if they do not exist
            //     for (const property of sensor.properties) {
            //         await addNewEntryToTable(SensorProperty, { propertyName: property, model: sensor.moduleName, manufacturer: sensor.manufacturer })
            //     }
            // }

        // Send message to all connected clients, so page can reload devices
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ event: "list_units", units: message.units }));
            }
        });

        return resolve({ message: "Device created" });
    });
}




const updateDeviceStatus = async (message: any) => {
    return new Promise(async (resolve, _) => {
        let devices = [];


        // If list of units
        // if (message.units) {
        //     console.log("test");
        for (const unit of message.units) {
            const deviceId = unit.mac;
            devices.push(deviceId);
            console.log("In update device status: ", message, deviceId);
            const existingDevice = await Device.findOne({ where: { deviceId: deviceId } });

            if (!existingDevice) {
                return resolve({ message: "Device does not exist in database yet" });
            }

            await Device.update({ batteryLevel: unit.batteryLevel, connectStatus: "connected", lastHeartbeat: unit.lastSeen }, { where: { deviceId } });
        }

        // return resolve({ message: "Device status updated" });

        // all other devices to non-active
        const allDevices = await Device.findAll({ where: { connectStatus: "connected" } });
        for (const device of allDevices) {
            if (!devices.includes(device.deviceId)) {
                await Device.update({ connectStatus: "disconnected" }, { where: { deviceId: device.deviceId } });
            }
        }

        return resolve({ message: "Device status updated" });

    });
}




