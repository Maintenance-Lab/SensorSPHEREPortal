import Project from "../models/Project.js";
import Manufacturer from "../models/Manufacturer.js";
import SensorCategory from "../models/SensorCategory.js";
import SensorProperty from "../models/SensorProperty.js";
import DeviceSensorMapping from "../models/mappings/DeviceSensorMapping.js";
import Device from "../models/Device.js";
import Sensor from "../models/Sensor.js";
import e from "express";

/*
Message example received from MQTT:

{
    deviceId: "FF:FF:FF:FF:FF:FF"
    manufacturerName: "Philips",
    connectStatus: "connected",
    batteryLevel: 100,
    maxHz: 100,
    channel: 1,
    sensors: [ {
                model: "model1",
                manufacturerName: "Philips",
                categoryName : "category1"
                properties: ["Gyro X", "Gyro Y", "Gyro Z"]
               }
            ]
}

*/

export const MQTTMessage = async (topic: string, message: Buffer) => {
    return new Promise(async (resolve, _) => {

        const deviceId = topic.split("/")[1];
        console.log("Device ID: ", deviceId);
        const postfix = topic.split("/")[2];
        message = JSON.parse(message.toString());

        switch (postfix) {
            case "msg":
                console.log("Got message on msg topic");
                addDeviceToDatabase(message, deviceId);
                break;
            case "cfg":
                console.log("Got message on cfg topic");
                break;
            case "speedtest":
                console.log("Got message on speedtest topic");
                break;
        }

        return resolve({ message: "Message received" });
    });
}

const addNewEntryToTable = async (table: any, entry: any) => {
    return new Promise(async (resolve, reject) => {
        console.log("In add new entry to table: ", table, entry);

        const existingEntry = await table.findOne({ where: entry });

        if (!existingEntry) {
            const doc = await table.create( entry );
            if (!doc) return reject(new Error("Error creating entry"));
        }

        return resolve({ message: "Entry created" });
    });
}


const addOrUpdateDevice = async (entry: any) => {
    return new Promise(async (resolve, reject) => {
        console.log("In add or update device");

        const existingDevice = await Device.findOne({ where: { deviceId: entry["deviceId"] } });

        if (existingDevice) {
            // update device
            const doc = await existingDevice.update( entry );
            if (!doc) return reject(new Error("Error updating entry"));
        }
        else {
            const doc = await Device.create( entry );
            if (!doc) return reject(new Error("Error creating entry"));
        }

        return resolve({ message: "Entry created or updated" });
    });
}


const addDeviceToDatabase = async (message: any, deviceId: string) => {
    return new Promise(async (resolve, _) => {
        console.log("In add device to database: ", message, deviceId);

        // If device manufacturer does not exist, add it to database
        addNewEntryToTable(Manufacturer, { manufacturerName: message.manufacturerName })

        // Add device to database if device does not exist
        addOrUpdateDevice({ deviceId: deviceId, manufacturerName: message.manufacturerName, connectStatus: message.connectStatus, batteryLevel: message.batteryLevel, maxHz: message.maxHz })


        // If sensor category or manufacturer does not exist, add it to database
        // Then add sensor to database
        for (const sensor of message.sensors) {
            addNewEntryToTable(SensorCategory, { categoryName: sensor.categoryName })
            addNewEntryToTable(Manufacturer, { manufacturerName: sensor.manufacturerName })
            addNewEntryToTable(Sensor, { model: sensor.model, manufacturerName: sensor.manufacturerName, categoryName: sensor.categoryName })

            // Add device sensor mapping to database if it does not exist
            addNewEntryToTable(DeviceSensorMapping, { channel: message.channel, deviceId: deviceId, model: sensor.model, manufacturerName: sensor.manufacturerName })

            // Add sensor properties to database if they do not exist
            for (const property of sensor.properties) {
                addNewEntryToTable(SensorProperty, { propertyName: property, model: sensor.model, manufacturerName: sensor.manufacturerName })
            }
        }


        // GEBLEVEN BIJ:
        // alles toevoegen aan database als je een nieuwe message krijgt
        // tot nu toe gedaan:
        //  - manufacturer device toevoegen
        //  - manufacturer sensor toevoegen
        //  - sensor category toevoegen
        //  - sensor toevoegen
        //  - device toevoegen
        //  - device sensor mapping toevoegen
        //  - uitzoeken wat die sensor property is/doet en toevoegen
        //
        // TODO:
        // device sensor config komt later als user daadwerkelijk wil gaan meten



        // // Add device to database if device does not exist
        // const device = await Device.findOne({ where: { deviceId } });
        // if (!device) {
        //     console.log("Device does not exist, creating device");
        //     try {
        //         const doc = await Device.create(message);
        //         if (!doc) return reject(new Error("Error creating device"));
        //     }
        //     catch (error) {
        //         console.log("Error creating device: ", error);
        //     }
        // }

        return resolve({ message: "Device created" });
    });
}

// try {
//     const doc = await Manufacturer.create({ manufacturerName: messageJSON.manufacturerName });
//     if (!doc) return reject(new Error("Error creating manufacturer"));
// }
// catch (error) {
//     console.log("Error creating manufacturer: ", error);
// }




// export const addConfigToDatabase = async (message: string, deviceId: string) => {
//     return new Promise(async (resolve, _) => {
//         console.log("In add config to database: ", message, deviceId);

//         return resolve({ message: "Device created" });
//     });
// }




