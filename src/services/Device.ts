import Device from "../models/Device.js";
import SessionDeviceMapping from "../models/mappings/SessionDeviceMapping.js";
import DeviceModuleMapping from "../models/mappings/DeviceModuleMapping.js";
import DeviceSensorConfiguration from "../models/DeviceSensorConfiguration.js";
import mqtt from '../index.js';
import WebSocket from 'ws';
import { FIRMWARE } from '../config.js';

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
    const modules: { [key: string]: any[] } = {};

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
    console.dir(deviceProperties, { depth: null, colors: true });
    return deviceProperties;
};

// Geen hulp functies -----------------------------------------------------------
export const getAllDevices = async (): Promise<Device[]> => {
    const results = await Device.findAll();
    if (!results) return [];
    return results;
}

// Devices mapped to session
export const getDevicesMappedToSession = async (sessionId: number): Promise<Device[]> => {
    const result = await Device.findAll({
        include: {
            model: SessionDeviceMapping,
            where: { sessionId: sessionId },
            required: true
        }
    });
    if (!result) return [];
    return result;
}

// Devices not mapped to session
// ***TODO?: BETTER DESCRIPTIVE FUNCTION NAME***
export const getAllAvailableDevicesSession = async (sessionId: number): Promise<Device[]> => {
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
    if (!result) return [];
    return result;
}

export const getSampleRate = async (sessionId: number, deviceId: string): Promise<any> => {
    const doc = await SessionDeviceMapping.findOne({
        where : { sessionId: sessionId, deviceId: deviceId },
        attributes: ['sampleRate'],
        raw: true,
    });

    if (!doc || doc.sampleRate === null || doc.sampleRate === undefined) {
        return null;
    }

    return doc.sampleRate;
};

export const getDeviceById = async (id: string): Promise<Device> => {
    const doc = await Device.findByPk(id);
    if (!doc) throw new Error("Device not found");
    return doc.toJSON();
}

export const getDeviceProperties = async (deviceId: string) => {
    const configEntries = await DeviceSensorConfiguration.findAll({
        where: { deviceId },
        attributes: ['sensorProperty', 'sensorType', 'active'],
        raw: true
    });

    if (!configEntries.length) throw new Error("No config entries");

    // Get module mappings
    const moduleMappings = await DeviceModuleMapping.findAll({
        where: { deviceId },
        attributes: ['moduleName', 'moduleManufacturer', 'sensorType'],
        raw: true
    });

    if (!moduleMappings.length) throw new Error("No module mappings");

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

    if (!result) throw new Error("No properties found");
    return result;
}

export const getSelectedProperties = async (sessionId: number, deviceId: string): Promise<any> => {
    const configEntries = await DeviceSensorConfiguration.findAll({
        where: { sessionId: sessionId, deviceId: deviceId, active: true },
        attributes: ['sensorProperty', 'sensorType'],
        raw: true
    });

    if (!configEntries.length) return [];

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

    if (!result) return [];
    return result
}

export const listUnits = async (): Promise<any> => {
  const message = { filterActiveOnly: true };
  const options = { qos: 2 };

  return new Promise((resolve, reject) => {
    mqtt.publish("interface/listUnits", JSON.stringify(message), options);

    // Define a handler for incoming WebSocket messages
    const handler = (raw: WebSocket.RawData) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.event === "list_units") {
          socket.removeListener("message", handler);
          resolve(data.units);
        }
      } catch (err) {
        reject(err);
      }
    };

    // Attach the handler to the WebSocket
    socket.on("message", handler);

    setTimeout(() => {
      socket.removeListener("message", handler);
        reject(new Error("Timeout waiting for list_units response"));
    }, 5000);
  });
};

export const sendConfigurationToDevice = async (deviceId: any): Promise<any> => {
  const properties = await getDeviceProperties(deviceId);
  if (!properties) throw new Error("Failed to fetch all properties");

  const deviceProperties = await createPropertyDict(properties, deviceId);
  if (!deviceProperties) throw new Error("Failed to create property dictionary");

  const message = await createConfigMessage(deviceProperties);
  const options = { qos: 2 };

  return new Promise((resolve, reject) => {
    mqtt.publish("interface/validateConfiguration", JSON.stringify(message), options);

    // Define a handler for incoming WebSocket messages
    const handler = (raw: WebSocket.RawData) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.event === "sampleRate" && data.deviceId === deviceId) {
          socket.removeListener("message", handler);
          clearTimeout(timeout);
          resolve(data.sampleRate);
        }
      } catch (err) {
        reject(err);
      }
    };

    // Attach the handler to the WebSocket
    socket.on("message", handler);

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      socket.removeListener("message", handler);
      resolve(null);
    }, 7500);
  });
};

const getBatchUnits = async (sessionId: number) => {
    // Get all devices for the session
    const devices = await SessionDeviceMapping.findAll({
        where: { sessionId: sessionId },
        attributes: ['deviceId'],
        raw: true
    });
    if (!devices) throw new Error("Failed to fetch devices");

    const units = devices.map(device => device.deviceId);
    const message = {
        "units": units
    }

    return message;
}

export const sendStartBatch = async (sessionId: number): Promise<any> => {
    const message = await getBatchUnits(sessionId);
    if (!message) throw new Error("Failed to create batch message");

    const options = { qos: 2 };
    mqtt.publish("interface/startBatch", JSON.stringify(message), options);
    return { message: "Batch started" };
}

export const sendStopBatch = async (sessionId: number): Promise<any> => {
    const message = await getBatchUnits(sessionId);
    if (!message) throw new Error("Failed to create batch message");

    const options = { qos: 2 };
    mqtt.publish("interface/stopBatch", JSON.stringify(message), options);
    return { message: "Batch stopped" };
}

export const saveSampleRate = async (sessionId: number, deviceId: string, sampleRate: number): Promise<any> => {
    const doc = await SessionDeviceMapping.update(
        { sampleRate: sampleRate },
        { where: { sessionId: sessionId, deviceId: deviceId } }
    );
    if (!doc) throw new Error("Failed to update sample rate");
    return doc;
}

export const updateSelectedProperties = async (sessionId: number, deviceId: string, selectedProperties: any): Promise<any> => {
    try {
        // set all properties from device and session to inactive
        const updatedPropertiesFalse = await DeviceSensorConfiguration.update(
            { active: false },
            { where: { sessionId: sessionId, deviceId: deviceId } }
        );
        if (!updatedPropertiesFalse) throw new Error("Failed to update properties");

        for (const p of selectedProperties) {
            if (p.split(":").length === 4) {
                const { sensorType, sensorProperty } = splitProperty(p);

                // set all selected properties to active
                const updatedPropertyTrue = await DeviceSensorConfiguration.update(
                    { active: true },
                    { where: { sessionId: sessionId, deviceId: deviceId, sensorType: sensorType, sensorProperty: sensorProperty } }
                );
                if (!updatedPropertyTrue) throw new Error("Failed to update properties");
            }
        }
        return "Properties updated successfully";
    }   catch (error) {
        console.error("Database query failed:", error);
        return "Failed to update properties";
    }
}









