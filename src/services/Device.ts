import Device from "../models/Device.js";
import Project from "../models/Project.js";
import Manufacturer from "../models/Manufacturer.js";
import SessionDeviceMapping from "../models/mappings/SessionDeviceMapping.js";


export const getAllDevices = async (): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevices");
        const results = await Device.findAll();
        if (!results) return resolve([]);
        // console.log("all devices", results);
        // return resolve(docs.map(doc => doc.toJSON()));
        return resolve(results);


        // return new Promise(async (resolve) => {
        //     const results = await Project.findAll();
        //     if (!results) return resolve([]);
        //     console.log("ALL PROJECTS: ", results.map((r) => r.projectId));
        //     return resolve(results);
    });
}

export const getAllDevicesSession = async (sessionId: number): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevices");;

        const devices = await Device.findAll();
        if (!devices) return resolve([]);

        const mapping = await SessionDeviceMapping.findAll({ where: { sessionId } });
        if (!mapping) return resolve([]);

        const deviceIds = mapping.map((m) => m.deviceId);
        const results = devices.filter((device) => !deviceIds.includes(device.deviceId));
        if (!results) return resolve([]);

        // return all devices that are not mapped with session
        return resolve(results);
    });
}



export const getDeviceById = async (id: number): Promise<Device> => {
    return new Promise(async (resolve, reject) => {
        console.log("in getDeviceById", id);
        const doc = await Device.findByPk(id);
        if (!doc) return reject(new Error("Device not found"));
        return resolve(doc.toJSON());
    });
}

export const addDeviceData = async (topic: string, message: Buffer) => {
    return new Promise(async (resolve, reject) => {

        console.log("IN DEVICES API");

        console.log("message: ", message.toString());
        const messageString = message.toString();

        const deviceId = topic.split("/")[1];
        const messageJSON = JSON.parse(messageString);
        console.log("messageJSON: ", messageJSON);

        // if manufacturer not in database, add it
        const manufacturer = await Manufacturer.findOne({ where: { manufacturerName: messageJSON.manufacturerName } });
        if (!manufacturer) {
            try {
                const doc = await Manufacturer.create({ manufacturerName: messageJSON.manufacturerName });
                if (!doc) return reject(new Error("Error creating manufacturer"));
                console.log("Manufacturer created: ", doc);
            }
            catch (error) {
                console.log("Error creating manufacturer: ", error);
            }
        }

        // Add device to database if device does not exist
        const device = await Device.findOne({ where: { deviceId } });
        if (!device) {
            console.log("Device does not exist, creating device");
            console.log("messageJSON: ", messageJSON);
            try {
                const doc = await Device.create(messageJSON);
                if (!doc) return reject(new Error("Error creating device"));
                console.log("Device created: ", doc);
            }
            catch (error) {
                console.log("Error creating device: ", error);
            }
        }

        return resolve({ message: "Device created" });
    });
}






