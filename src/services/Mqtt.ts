import Manufacturer from "../models/Manufacturer.js";
import Property from "../models/Property.js";
import DeviceModuleMapping from "../models/mappings/DeviceModuleMapping.js";
import Device from "../models/Device.js";
import Module from "../models/Module.js";
import DeviceModel from "../models/DeviceModel.js";
import Sensor from "../models/Sensor.js";
import WebSocket from 'ws';

// Set up WebSocket server
export const wss = new WebSocket.Server({ port: 8080 });

export const MQTTMessage = async (topic: string, message: Buffer) => {
    return new Promise(async (resolve, _) => {
        const topicParts = topic.split("/");
        message = JSON.parse(message.toString());

        if (topic == "interface/listUnitsResult") {
            // Devices that are online
            if (topicParts[1] === 'listUnitsResult') {
                console.log("Got message on listUnitsResult topic");
                addDeviceToDatabase(message);
            }
        }
        else if (topicParts[0] == "interface" && topicParts[2] == "validateConfigurationResult") {
            updateFrequency(message);
        }

        return resolve({ message: "Message received" });
    });
}

export const updateFrequency = async (message: any) => {
    return new Promise(async (resolve, reject) => {
        const deviceId = message.mac;
        const frequency = message.sampleRate;;
        console.log("In return configurations: ", deviceId, frequency);

        sendFrequency(frequency, deviceId);

        // Update device with sampleRate
        const doc = await Device.update({ sampleRate: frequency }, { where: { deviceId } });
        if (!doc) return reject(new Error("Error updating entry"));

        return resolve({ message: "Frequency updated" });
    });
}

const sendFrequency = (frequency: number, deviceId: string) => {
    console.log("sending frequency to sockt: ", frequency);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ event: "frequency", frequency: frequency, deviceId: deviceId }));
        }
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

// TODO: test of nieuwe device goed wordt opgeslagen
const addDeviceToDatabase = async (message: any) => {
    return new Promise(async (resolve, _) => {

        // Loop through all units in message
        for (const unit of message.units) {
            const deviceId = unit.mac;

            // Add device to database if device does not exist
            await addOrUpdateDevice({ deviceId: deviceId, manufacturer: unit.manufacturer, model: unit.model, batteryLevel: unit.batteryLevel })

            // If module manufacturer does not exist, add it to database
            for (const module of unit.sensorModules) {
                await addNewEntryToTable(Manufacturer, { manufacturer: module.manufacturer })

                // If sensor type does not exist, add it to database
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
        }

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
        const deviceId = message.mac;
        console.log("In update device status: ", message, deviceId);
        const existingDevice = await Device.findOne({ where: { deviceId: deviceId } });

        if (!existingDevice) {
            return resolve({ message: "Device does not exist in database yet" });
        }

        message.connectStatus = "connected";
        // Set right battery level, connection status and lastHearbeat date for device
        await Device.update({ batteryLevel: message.battery, connectStatus: message.status, lastHeartbeat: Date.now() }, { where: { deviceId } });

        return resolve({ message: "Device status updated" });
    });
}




