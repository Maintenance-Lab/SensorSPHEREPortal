import Project from "../models/Project.js";
import Manufacturer from "../models/Manufacturer.js";
import SensorCategory from "../models/SensorCategory.js";
import SensorProperty from "../models/SensorProperty.js";
import DeviceSensorMapping from "../models/mappings/DeviceSensorMapping.js";
import Device from "../models/Device.js";
import Sensor from "../models/Sensor.js";

// TODO:
// device sensor config komt later als user daadwerkelijk wil gaan meten
//  ------------------------------------


export const MQTTMessage = async (topic: string, message: Buffer) => {
    return new Promise(async (resolve, _) => {

        console.log("Message: ", message.toString());
        const postfix = topic.split("/")[2];
        message = JSON.parse(message.toString());

        switch (postfix) {
            case "msg":
                console.log("Got message on msg topic");
                await addDeviceToDatabase(message);
                break;
            case "heartbeat":
                await updateDeviceStatus(message);
                break;
            case "announce":
                console.log(message)
                await addDeviceToDatabase(message);
                break;
            case "speedtest":
                console.log("Got message on speedtest topic");
                break;
            case "initial":
                console.log("Got message on initial topic");
                // await addDeviceToDatabase(message, deviceId);
                break;
        }

        return resolve({ message: "Message received" });
    });
}

const addNewEntryToTable = async (table: any, entry: any) => {
    return new Promise(async (resolve, reject) => {
        console.log("In add new entry to table: ", table, entry);

        let entryPK: any = {};
        for (const attribute of table.primaryKeyAttributes) {
            entryPK[attribute] = entry[attribute];
        }

        let existingEntry;
        try {
            existingEntry = await table.findOne({ where: entry });
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
            console.log("Device does not exist, creating device");
            const doc = await Device.create( entry );
            if (!doc) return reject(new Error("Error creating entry"));
        }

        return resolve({ message: "Entry created or updated" });
    });
}


const addDeviceToDatabase = async (message: any) => {
    return new Promise(async (resolve, _) => {

        // Loop through all units in message
        for (const unit of message.units) {
            const deviceId = unit.mac;

            // Add device to database if device does not exist
            await addOrUpdateDevice({ deviceId: deviceId, connectStatus: unit.status, batteryLevel: unit.battery })

            // If sensor category or manufacturer does not exist, add it to database
            // Then add sensor to database
            for (const sensor of unit.sensors) {

                await addNewEntryToTable(Manufacturer, { manufacturerName: sensor.manufacturer })
                await addNewEntryToTable(Sensor, { model: sensor.model, manufacturerName: sensor.manufacturer })

                // Add device sensor mapping to database if it does not exist
                await addNewEntryToTable(DeviceSensorMapping, { deviceId: deviceId, model: sensor.model, manufacturerName: sensor.manufacturer, channel: sensor.channel })

                // Add sensor properties to database if they do not exist
                for (const property of sensor.properties) {
                    await addNewEntryToTable(SensorProperty, { propertyName: property, model: sensor.model, manufacturerName: sensor.manufacturer })
                }
            }
        }

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




