import Device from "../models/Device.js";
import SessionDeviceMapping from "../models/mappings/SessionDeviceMapping.js";
import DeviceModuleMapping from "../models/mappings/DeviceModuleMapping.js";
import Property from "../models/Property.js";
import DeviceSensorConfiguration from "../models/DeviceSensorConfiguration.js";
import { Op } from "sequelize";
import mqtt from '../index.js';
import WebSocket from 'ws';
import Sensor from "../models/Sensor.js";

import { FIRMWARE } from '../config.js';
import Session from "src/models/Session.js";
import { get } from "http";

const socket = new WebSocket('ws://localhost:8080');

// Hulp functies
const splitProperty = (property: string): any => {
    const split = property.split(":");
    const sensorType = split[2];
    const sensorProperty = split[3];
    return { sensorType, sensorProperty };
}
const createConfigMessage = async (deviceProperties: any) => {
// const createConfigMessage = async (deviceId: string, properties: any) => {
    const { deviceId, models } = deviceProperties;
    const message: any = {
        "mac": deviceId,
        "firmware": FIRMWARE,
        "sensorModules": deviceProperties.modules,
    };

    console.log("message: ", message);
    return message;
};

const createPropertyDict = (properties: any, deviceId: string) => {
    const deviceProperties: any = { deviceId };
    const modules: { [key: string]: any[] } = {}; // Simplified typing for modules

    properties.forEach((property: any) => {
        const { moduleManufacturer, moduleName, sensorType, propertyName, active } = property;
        const groupKey = "sensorModules";

        if (!modules[groupKey]) {
            modules[groupKey] = [];
        }

        let existingModule = modules[groupKey].find(module => module.moduleName === moduleName);
        if (!existingModule) {
            existingModule = {
                moduleName: moduleName,
                moduleManufacturer: moduleManufacturer,
                sensors: []
            };
            modules[groupKey].push(existingModule);
        }

        let existingSensor = existingModule.sensors.find((sensor: any) => sensor.sensorType === sensorType);
        if (!existingSensor) {
            existingSensor = {
                sensorType: sensorType,
                measurements: []
            };
            existingModule.sensors.push(existingSensor);
        }

        existingSensor.measurements.push({
            type: propertyName,
            active: active === 1
        });
    });

    deviceProperties.modules = modules;
    console.log("deviceProperties: ");
    console.dir(deviceProperties, { depth: null, colors: true });
    return deviceProperties;
};

// const createPropertyDict = async (properties: any[], deviceId: string) => {
//     console.log(" properties in createPropertyDict", properties);
//     // manufacturers: { M5stack: { ENV3: [Array] }, M5stack5: { ENV35: [Array] } }

//     let deviceProperties: any = { deviceId };
//     // let manufacturers: any = {};
//     let models: any = {};

//     properties.forEach((property: any) => {
//         // const { manufacturer, model, propertyName } = property;
//         const { moduleManufacturer, moduleName, sensorType, propertyName } = property;
//         console.log("manufactureer, model, sensorType, propertyName: ", moduleManufacturer, moduleName, sensorType, propertyName);

//         // // If model doesn't exist in the models object, create it
//         // if (!models[model]) {
//         //     models[model] = {};
//         // }
//         // // If the manufacturer doesn't exist under the model, create it
//         // if (!models[model][manufacturer]) {
//         //     models[model][manufacturer] = [];
//         // }
//         // models[model][manufacturer].push(propertyName);

//         // // If the manufacturer doesn't exist in the manufacturers object, create it
//         // if (!manufacturers[manufacturer]) {
//         //     manufacturers[manufacturer] = {};
//         // }
//         // // If the model doesn't exist under the manufacturer, create it
//         // if (!manufacturers[manufacturer][model]) {
//         //     manufacturers[manufacturer][model] = [];
//         // }
//         // manufacturers[manufacturer][model].push(propertyName);
//     });

//     deviceProperties.models = models;
//     // deviceProperties.manufacturers = manufacturers;
//     console.log("deviceProperties: ", deviceProperties);
//     return deviceProperties;
// };


// Geen hulp functies -----------------------------------------------------------
export const getAllDevices = async (): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevices");
        const results = await Device.findAll();
        if (!results) return resolve([]);
        return resolve(results);
    });
}

// Devices mapped to session
export const getDevicesMappedToSession = async (sessionId: number): Promise<Device[]> => {
    console.log("in getDevicesMappedToSession");
    return new Promise(async (resolve) => {
        const result = await Device.findAll({
            include: {
                model: SessionDeviceMapping,
                where: { sessionId: sessionId },
                required: true
            }
        });
        if (!result) return resolve([]);
        console.log("result: ", result);
        return resolve(result);
    });
}

// Devices not mapped to session
// ***TODO?: BETTER DESCRIPTIVE FUNCTION NAME***
export const getAllAvailableDevicesSession = async (sessionId: number): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        // Left join with null check(to minus the inner join)
        const result = await Device.findAll({
            include: [{
                model: SessionDeviceMapping,
                where: { sessionId: sessionId },
                required: false
            }],
            where: {
                '$sessionDeviceMappings.sessionId$': null
            }
        });
        if (!result) return resolve([]);
        console.log("in getAllAvailableDevicesSession");
        console.log("SessionId: ", sessionId);
        return resolve(result);
      });
}

export const getSampleRate = async (sessionId: number, deviceId: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        const doc = await SessionDeviceMapping.findOne({
            where : { sessionId: sessionId, deviceId: deviceId },
            attributes: ['sampleRate'],
            raw: true,
        });
        if (!doc) return reject(new Error("Mapping not found"));

        const sampleRate = doc.sampleRate;
        if (sampleRate === null || sampleRate === undefined) {
            return reject(new Error("Sample rate not found"));
        }
        return resolve(sampleRate);
    });
};

export const getDeviceById = async (id: string): Promise<Device> => {
    return new Promise(async (resolve, reject) => {
        console.log("in getDeviceById", id);
        const doc = await Device.findByPk(id);
        if (!doc) return reject(new Error("Device not found"));
        return resolve(doc.toJSON());
    });
}

export const getDeviceProperties = async (deviceId: string) => {
    return new Promise(async (resolve, reject) => {
        console.log("in getDeviceProperties");

        const configEntries = await DeviceSensorConfiguration.findAll({
            where: { deviceId },
            attributes: ['sensorProperty', 'sensorType', 'active'],
            raw: true
        });

        if (!configEntries.length) return reject(new Error("No config entries"));

        // Get module mappings
        const moduleMappings = await DeviceModuleMapping.findAll({
            where: { deviceId },
            attributes: ['moduleName', 'moduleManufacturer', 'sensorType'],
            raw: true
        });

        if (!moduleMappings.length) return reject(new Error("No module mappings"));

        // Now match properties with module mappings based on sensorType
        const result = [];

        for (const config of configEntries) {
            const mapping = moduleMappings.find(
              map => map.sensorType === config.sensorType
            );

            if (mapping) {
              result.push({
                moduleManufacturer: mapping.moduleManufacturer,
                moduleName: mapping.moduleName,
                sensorType: config.sensorType,
                propertyName: config.sensorProperty,
                active: config.active
              });
            }
          }

        if (!result) return reject(new Error("No properties found"));
        return resolve(result)
    });;
};

export const getSelectedProperties = async (sessionId: number, deviceId: string): Promise<any> => {
    return new Promise(async (resolve, _) => {
        const configEntries = await DeviceSensorConfiguration.findAll({
            where: { sessionId: sessionId, deviceId: deviceId, active: true },
            attributes: ['sensorProperty', 'sensorType'],
            raw: true
        });

        if (!configEntries.length) return resolve([]);

        // Get module mappings
        const moduleMappings = await DeviceModuleMapping.findAll({
            where: { deviceId },
            attributes: ['moduleName', 'moduleManufacturer', 'sensorType'],
            raw: true
        });

        // Now match properties with module mappings based on sensorType
        const result = [];

        for (const config of configEntries) {
            const mapping = moduleMappings.find(
              map => map.sensorType === config.sensorType
            );

            if (mapping) {
              result.push({
                moduleManufacturer: mapping.moduleManufacturer,
                moduleName: mapping.moduleName,
                sensorType: config.sensorType,
                propertyName: config.sensorProperty
              });
            }
          }

        if (!result) return resolve([]);
        return resolve(result)
    });;
}

export const listUnits = async (): Promise<any> => {
    return new Promise(async (resolve, _) => {
        const message = {
            "filterActiveOnly": true,
        }
        const options = { qos: 2 };
        mqtt.publish("interface/listUnits", JSON.stringify(message), options);

        console.log("Requesting list of units ---------");
        socket.onmessage = (event) => {
            const data = JSON.parse(event.data.toString());
            if (data.event === "list_units") {
                return resolve(data.units);
            }
        }
    });
}


export const sendConfigurationToDevice = async (sessionId: number, deviceId: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        console.log("Sending configuration to device: ", sessionId, deviceId);

        // Get all properties for the device
        const properties = await getDeviceProperties(deviceId);
        console.log("allProperties: ", properties);
        if (!properties) return reject(new Error("Failed to fetch all properties"));

        const deviceProperties = await createPropertyDict(properties, deviceId);
        if (!deviceProperties) return reject(new Error("Failed to create property dictionary"));

        const message = await createConfigMessage(deviceProperties);
        console.log("MESSAGE");
        console.dir(message, { depth: null, colors: true });
        // console.log("Message ----------------- : \n", message);

        // Send configuration (selected properties) to gateway
        const options = { qos: 2 };
        mqtt.publish("interface/" + deviceId + "/validateConfiguration", JSON.stringify(message), options);

        const timeout = setTimeout(() => {
            resolve(null);
        }, 5000);

        socket.onmessage = async (event) => {
            console.log("Received message from server: ", event.data);
            const data = JSON.parse(event.data.toString());

            if (data.event === "sampleRate" && data.deviceId === deviceId) {
                console.log("sample rate updated for device: ", data.sampleRate, data.deviceId);

                // const doc = await SessionDeviceMapping.update(
                //     { sampleRate: data.sampleRate },
                //     { where: { sessionId: sessionId, deviceId: deviceId } }
                // );
                // if (!doc) return reject(new Error("Failed to update sample rate"));

                clearTimeout(timeout);
                return resolve(data.sampleRate);
            }
        };
    });
}

const getBatchUnits = async (sessionId: number) => {
    return new Promise(async (resolve, reject) => {
        console.log("in getBatchUnits");
        // Get all devices for the session
        const devices = await SessionDeviceMapping.findAll({
            where: { sessionId: sessionId },
            attributes: ['deviceId'],
            raw: true
        });
        if (!devices) return reject(new Error("Failed to fetch devices"));
        console.log("Devices: ", devices);

        const units = devices.map(device => device.deviceId);
        console.log("Units: ", units);

        const message = {
            "units": units
        }

        return resolve(message);
    });
}

export const sendStartBatch = async (sessionId: number): Promise<any> => {
    return new Promise(async (_, reject) => {
        console.log("Starting batch for session: ", sessionId);

        const message = await getBatchUnits(sessionId);
        if (!message) return reject(new Error("Failed to create batch message"));

        const options = { qos: 2 };
        mqtt.publish("interface/startBatch", JSON.stringify(message), options);
        console.log("Batch started for session: ", sessionId);
    });
}

export const sendStopBatch = async (sessionId: number): Promise<any> => {
    return new Promise(async (_, reject) => {
        console.log("Stopping batch for session: ", sessionId);

        const message = await getBatchUnits(sessionId);
        if (!message) return reject(new Error("Failed to create batch message"));

        const options = { qos: 2 };
        mqtt.publish("interface/stopBatch", JSON.stringify(message), options);
    });
}

export const saveSampleRate = async (sessionId: number, deviceId: string, sampleRate: number): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        console.log("In save sample rate: ", sampleRate, deviceId);
        const doc = await SessionDeviceMapping.update(
            { sampleRate: sampleRate },
            { where: { sessionId: sessionId, deviceId: deviceId } }
        );
        if (!doc) return reject(new Error("Failed to update sample rate"));
        return resolve(doc);
    });
}

export const updateSelectedProperties = async (sessionId: number, deviceId: string, selectedProperties: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        console.log("selectedProperties: ", selectedProperties);
        try {
            // set all properties from device and session to inactive
            const updatedPropertiesFalse = await DeviceSensorConfiguration.update(
                { active: false },
                { where: { sessionId: sessionId, deviceId: deviceId } }
            );
            if (!updatedPropertiesFalse) return reject(new Error("Failed to update properties"));

            for (const p of selectedProperties) {
                if (p.split(":").length === 4) {
                    const { sensorType, sensorProperty } = splitProperty(p);

                    // set all selected properties to active
                    const updatedPropertyTrue = await DeviceSensorConfiguration.update(
                        { active: true },
                        { where: { sessionId: sessionId, deviceId: deviceId, sensorType: sensorType, sensorProperty: sensorProperty } }
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









