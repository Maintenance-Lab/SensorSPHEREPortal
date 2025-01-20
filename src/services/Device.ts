import Device from "../models/Device.js";
import Project from "../models/Project.js";
import Manufacturer from "../models/Manufacturer.js";
import SessionDeviceMapping from "../models/mappings/SessionDeviceMapping.js";
import DeviceSensorMapping from "../models/mappings/DeviceSensorMapping.js";
import SensorProperty from "../models/SensorProperty.js";
import Sensor from "../models/Sensor.js";


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

// Devices mapped to session
export const getDevicesMappedToSession = async (sessionId: number): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevicesMappedToSession");

        // Fetch all devices
        const devices = await Device.findAll();
        if (!devices) return resolve([]);

        // Get the session-device mappings for the given sessionId
        const mapping = await SessionDeviceMapping.findAll({ where: { sessionId } });
        if (!mapping) return resolve([]);

        // Extract the deviceIds from the mappings
        const deviceIds = mapping.map((m) => m.deviceId);

        // Filter the devices to get only those that are mapped to the given session
        const results = devices.filter((device) => deviceIds.includes(device.deviceId));
        if (!results) return resolve([]);

        return resolve(results);
    });
}


// Devices not mapped to session
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



export const getDeviceById = async (id: string): Promise<Device> => {
    return new Promise(async (resolve, reject) => {
        console.log("in getDeviceById", id);
        const doc = await Device.findByPk(id);
        if (!doc) return reject(new Error("Device not found"));
        return resolve(doc.toJSON());
    });
}

export const deviceProperties = async (deviceId: string): Promise<SensorProperty[]> => {
    return new Promise(async (resolve, reject) => {

        const sensors = await DeviceSensorMapping.findAll({ where: { deviceId: deviceId } });
        if (!sensors) return reject(new Error("Sensors not found"));

        const properties:any = {};
        for (const sensor of sensors) {
            const model = sensor.dataValues.model;
            const manufacturerName = sensor.dataValues.manufacturerName;
            const sensorProperties = await SensorProperty.findAll({ where: { model: model, manufacturerName: manufacturerName } });
            if (!sensorProperties) return reject(new Error("Sensor properties not found"));

            if (!properties[manufacturerName]) {
                properties[manufacturerName] = {model: [], properties: []};
            }
            // if (!properties[manufacturerName][model]) {
            //     properties[manufacturerName][model] = [];
            // }

            // add the model to the dict
            properties[manufacturerName]["model"].push(model);

            // add the properties to the dict
            const propertyNames = sensorProperties.map((sp) => sp.propertyName);
            console.log("propertyNames: ", propertyNames);
            properties[manufacturerName]["properties"].push(propertyNames);
            // for (const sensorProperty of sensorProperties) {
            //     properties[manufacturerName][model].push(sensorProperty.propertyName);
            // }
        }

        console.log("properties: ", properties);
        return resolve(properties);
    });;
};

