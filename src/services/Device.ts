import Device from "../models/Device.js";
import Project from "../models/Project.js";
import Manufacturer from "../models/Manufacturer.js";
import SessionDeviceMapping from "../models/mappings/SessionDeviceMapping.js";
import DeviceSensorMapping from "../models/mappings/DeviceSensorMapping.js";
import SensorProperty from "../models/SensorProperty.js";
import Sensor from "../models/Sensor.js";
import DeviceSensorConfiguration from "../models/DeviceSensorConfiguration.js";
import { Op } from "sequelize";
import { get } from "http";
// import mqtt from "mqtt/*";
import mqtt from '../index.js';

// Hulp functies
const splitProperty = (property: string): any => {
    const manufacturerName = property.split(":")[0];
    const model = property.split(":")[1];
    const propertyName = property.split(":")[2];

    return { manufacturerName, model, propertyName };
}

const createConfigMessage = async (deviceProperties: any) => {
    const deviceId = deviceProperties.deviceId;
    const manufacturers = deviceProperties.manufacturers;
    const message: any = {
        "mac": deviceId,
        "sensors": []
    };

    for (const manufacturerName in manufacturers) {
        const models = manufacturers[manufacturerName];

        // Iterate through each model of the manufacturer
        for (const model in models) {
            const properties = models[model];
            const sensor = {
                "manufacturer": manufacturerName,
                "model": model,
                "properties": properties,
            };
            message.sensors.push(sensor);
        }
    }
    return message;
};

const createPropertyDict = async (properties: any[], deviceId: string) => {
    let deviceProperties: any = { deviceId };
    let manufacturers: any = {};

    properties.forEach((property: any) => {
        const { manufacturerName, model, propertyName } = property;

        // If the manufacturer doesn't exist in the manufacturers object, create it
        if (!manufacturers[manufacturerName]) {
            manufacturers[manufacturerName] = {};
        }
        // If the model doesn't exist under the manufacturer, create it
        if (!manufacturers[manufacturerName][model]) {
            manufacturers[manufacturerName][model] = [];
        }
        manufacturers[manufacturerName][model].push(propertyName);
    });

    deviceProperties.manufacturers = manufacturers;
    console.log("deviceProperties: ", deviceProperties);
    return deviceProperties;
};




// Geen hulp functies -----------------------------------------------------------
export const getAllDevices = async (): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevices");
        const results = await Device.findAll();
        if (!results) return resolve([]);
        return resolve(results);
    });
}

// Retrieve all devices with a lastHearbeat longer then 10 minutes ago
export const getAllOldDevices = async (): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllOldDevices");
        const results = await Device.findAll({ where: { connectStatus: "connected", lastHeartbeat: { [Op.lt]: Date.now() - 300000 } } });
        if (!results) return resolve([]);
        return resolve(results);
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

export const getDeviceProperties = async (deviceId: string): Promise<SensorProperty[]> => {
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

            // add the model to the dict
            properties[manufacturerName]["model"].push(model);

            // add the properties to the dict
            const propertyNames = sensorProperties.map((sp) => sp.propertyName);
            properties[manufacturerName]["properties"].push(propertyNames);
        }

        // console.log("properties: ", properties);
        return resolve(properties);
    });;
};

export const getSelectedProperties = async (sessionId: number, deviceId: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            const properties = await DeviceSensorConfiguration.findAll({
                where: { sessionId: sessionId, deviceId: deviceId, active: true },
            });
            if (!properties) return reject(new Error("Failed to fetch properties"));

            return resolve(properties);
        }   catch (error) {
            console.error("Database query failed:", error);
            return resolve("Failed to fetch properties");
        }
    });
}

export const sendConfigurationToDevice = async (sessionId: number, deviceId: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        console.log("Sending configuration to device: ", sessionId, deviceId);

        const properties = await getSelectedProperties(sessionId, deviceId);
        if (!properties) return reject(new Error("Failed to fetch properties"));

        const deviceProperties = await createPropertyDict(properties, deviceId);
        if (!deviceProperties) return reject(new Error("Failed to create property dictionary"));

        const message = await createConfigMessage(deviceProperties);
        console.log("Message: ", message);

        // Send configuration (selected properties) to gateway
        mqtt.publish("interface/" + deviceId + "/validateConfiguration", JSON.stringify(message));
        return resolve("Properties sent to device");
    });
}



export const updateSelectedProperties = async (sessionId: number, deviceId: string, selectedProperties: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        // console.log("Updating properties: ", sessionId, deviceId, selectedProperties);
        try {
            // set all properties from device and session to inactive
            const updatedPropertiesFalse = await DeviceSensorConfiguration.update(
                { active: false },
                { where: { sessionId: sessionId, deviceId: deviceId } }
            );
            if (!updatedPropertiesFalse) return reject(new Error("Failed to update properties"));

            for (const p of selectedProperties) {
                if (p.split(":").length === 3) {
                    const { manufacturerName, model, propertyName } = splitProperty(p);

                    // set all selected properties to active
                    const updatedPropertyTrue = await DeviceSensorConfiguration.update(
                        { active: true },
                        { where: { sessionId: sessionId, deviceId: deviceId, manufacturerName: manufacturerName, model: model, propertyName: propertyName } }
                    );
                    if (!updatedPropertyTrue) return reject(new Error("Failed to update properties"));
                }
            }
            return resolve("Properties updated successfully");
        }   catch (error) {
            console.error("Database query failed:", error);
            return resolve("Failed to update properties");
        }
    });

}









