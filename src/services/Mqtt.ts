import Manufacturer from "../models/Manufacturer.js";
import Property from "../models/Property.js";
import DeviceModuleMapping from "../models/mappings/DeviceModuleMapping.js";
import Device from "../models/Device.js";
import Module from "../models/Module.js";
import DeviceModel from "../models/DeviceModel.js";
import Sensor from "../models/Sensor.js";
import { WebSocketServer, WebSocket } from 'ws';
import mqtt from '../index.js';

// Set up WebSocket server
export const wss = new WebSocketServer({ port: 8080 });

export const MQTTMessage = async (topic: string, message: Buffer) => {
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
        addDeviceToDatabase(parsed_message);
    }
    else if (topic === 'interface/validateConfigurationResult') {
        console.log("Got message on validateConfigurationResult topic");
        sendSampleRate(parsed_message);
    }
    else {
        console.log("MQTT topic not implemented");
    }

    return { message: "Message received" };
}


const sendSampleRate= async (message: any) => {
    const deviceId = message.mac;
    const sampleRate = message.sampleRate;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ event: "sampleRate", sampleRate: sampleRate, deviceId: deviceId }));
        }
    });

    return { message: "Sample rate sent" };
}


const addNewEntryToTable = async (table: any, entry: any) => {
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
            if (!doc) throw new Error("Error creating entry");
        }
        catch(error) {
            console.log("dit is de error 2:", error)
        }
    }

    return { message: "Entry created" };
}


const addOrUpdateDevice = async (entry: any) => {
    console.log("In add or update device: ", entry);

    const existingDevice = await Device.findOne({ where: { deviceId: entry["deviceId"] } });

    if (existingDevice) {
        console.log("Device exists, updating device");
        const doc = await Device.update(entry, { where: { deviceId: entry["deviceId"] } });
        if (!doc) throw new Error("Error updating entry");
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
        if (!doc) throw new Error("Error creating entry");
    }

    return { message: "Entry created or updated" };
}



const addDeviceToDatabase = async (message: any) => {
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
                await addNewEntryToTable(Module, { name: module.moduleName, manufacturer: module.manufacturer, sensorType: sensor.sensorType })

                // Add deviceModuleMapping to database if it does not exist
                await addNewEntryToTable(DeviceModuleMapping, { deviceId: deviceId, moduleName: module.moduleName, moduleManufacturer: module.manufacturer, sensorType: sensor.sensorType })

                for (const measurement of sensor.measurements) {
                    // Accuracy is "±0.05", needs to be float
                    const accuracy = parseFloat(measurement.accuracy.replace("±", "").replace(",", ".").trim());
                    await addNewEntryToTable(Property, { name: measurement.type , sensorType: sensor.sensorType, unit: measurement.unit, accuracy: accuracy, rangeMin: measurement.minValue, rangeMax: measurement.maxValue })
                }
            }
        } catch (e) {
            console.log("Error parsing handshake payload: ", e);
        }
    }

    // // If sensor category or manufacturer does not exist, add it to database
    //     // Then add sensor to database
    //     for (const sensor of unit.sensorModules) {

    //         await addNewEntryToTable(Manufacturer, { manufacturer: sensor.manufacturer })
    //         await addNewEntryToTable(Sensor, { model: sensor.moduleName, manufacturer: sensor.manufacturer })


    //         // Add device sensor mapping to database if it does not exist
    //         await addNewEntryToTable(DeviceModuleMapping, { deviceId: deviceId, model: sensor.moduleName, manufacturer: sensor.manufacturer, channel: sensor.channel })

    //         // Add sensor properties to database if they do not exist
    //         for (const property of sensor.properties) {
    //             await addNewEntryToTable(SensorProperty, { propertyName: property, model: sensor.moduleName, manufacturer: sensor.manufacturer })
    //         }
    //     }
    // });

    return { message: "Device created" };
}

const updateDeviceStatus = async (message: any) => {
  console.log("IN UPDATE DEVICE STATUS");
  const now = new Date().getTime();

  // Run all device updates in parallel
  const updatePromises = message.units.map(async (unit: any) => {
    const deviceId = unit.mac;
    const lastSeenTime = new Date(unit.lastSeen).getTime();
    const isConnected = now - lastSeenTime <= 5 * 60 * 1000;

    // Update all fields in one go
    await Device.update(
      {
        batteryLevel: unit.battery,
        lastHeartbeat: unit.lastSeen,
        connectStatus: isConnected ? "connected" : "disconnected"
      },
      { where: { deviceId } }
    );
  });

  // Wait for all updates to finish
  await Promise.all(updatePromises);

  // Broadcast updated units to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: "list_units", units: message.units }));
    }
  });

  return { message: "Device status updated" };
};
