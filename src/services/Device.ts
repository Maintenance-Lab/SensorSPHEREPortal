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

const socket = new WebSocket('ws://localhost:8080');

// Hulp functies
const splitProperty = (property: string): any => {
    const manufacturer = property.split(":")[0];
    const model = property.split(":")[1];
    const propertyName = property.split(":")[2];

    return { manufacturer, model, propertyName };
}
const createConfigMessage = async (deviceProperties: any) => {
    console.log("DEVICE PROPERTIES: ", deviceProperties);
    const deviceId = deviceProperties.deviceId;
    // const manufacturers = deviceProperties.manufacturers;
    const models = deviceProperties.models;
    const message: any = {
        "mac": deviceId,
        "firmware": FIRMWARE,
        "sensorModules": []
    };

    // for (const manufacturer in manufacturers) {
    //     const models = manufacturers[manufacturer];

    //     // Iterate through each model of the manufacturer
    //     for (const model in models) {
    //         const properties = models[model];
    //         const sensor = {
    //             "manufacturer": manufacturer,
    //             "model": model,
    //             "properties": properties,
    //         };
    //         message.sensors.push(sensor);
    //     }
    // }

    // Iterate through each manufacturer in models
    for (const model in models) {
        // { "moduleName": "IMU",
		// 	"manufacturer": "M5Stack",
		// 	"sensors": [
		// 		{ "sensorType": "MPU6886",
		// 			"measurements": [
		// 				{ "type": "acceleration_x", "active": true },
		// 				{ "type": "acceleration_y", "active": true },
		// 				{ "type": "acceleration_z", "active": true },
		// 				{ "type": "gyroscope_x", "active": true },
		// 				{ "type": "gyroscope_y", "active": true },
		// 				{ "type": "gyroscope_z", "active": true },
		// 				{ "type": "temperature", "active": false }
		// 			]
		// 		}
		// 	]
		//  }




        // Iterate through each manufacturer of the model
        const manufacturers = models[model];
        for (const manufacturer in manufacturers) {
            const properties = manufacturers[manufacturer];
            const sensor = {
                "manufacturer": manufacturer,
                "model": model,
                "properties": properties,
            };
            message.sensorModules.push(sensor);
        }
    }
    console.log("message: ", message);

    return message;
};

const createPropertyDict = async (properties: any[], deviceId: string) => {
    // manufacturers: { M5stack: { ENV3: [Array] }, M5stack5: { ENV35: [Array] } }

    let deviceProperties: any = { deviceId };
    // let manufacturers: any = {};
    let models: any = {};

    properties.forEach((property: any) => {
        const { manufacturer, model, propertyName } = property;

        // If model doesn't exist in the models object, create it
        if (!models[model]) {
            models[model] = {};
        }
        // If the manufacturer doesn't exist under the model, create it
        if (!models[model][manufacturer]) {
            models[model][manufacturer] = [];
        }
        models[model][manufacturer].push(propertyName);

        // // If the manufacturer doesn't exist in the manufacturers object, create it
        // if (!manufacturers[manufacturer]) {
        //     manufacturers[manufacturer] = {};
        // }
        // // If the model doesn't exist under the manufacturer, create it
        // if (!manufacturers[manufacturer][model]) {
        //     manufacturers[manufacturer][model] = [];
        // }
        // manufacturers[manufacturer][model].push(propertyName);
    });

    deviceProperties.models = models;
    // deviceProperties.manufacturers = manufacturers;
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
        // Inner join
        const result = await Device.findAll({
            include: {
                model: SessionDeviceMapping,
                where: { sessionId: sessionId },
                required: true
            }});
        if (!result) return resolve([]);

        return resolve(result);
      });
}

// Devices not mapped to session
// ***TODO?: BETTER DESCRIPTIVE FUNCTION NAME***
export const getAllDevicesSession = async (sessionId: number): Promise<Device[]> => {
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
        console.log("in getAllDevicesSession");
        console.log("SessionId: ", sessionId);
        return resolve(result);
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

// TODO: check if this is still works. Only used for input of loadRows/TreeView as far as i know
export const getDeviceProperties = async (deviceId: string) => {
    return new Promise(async (resolve, reject) => {

        // const sensors = await DeviceModuleMapping.findAll({ where: { deviceId: deviceId } });
        // if (!sensors) return reject(new Error("Sensors not found"));

        // const properties:any = {};
        // for (const sensor of sensors) {
        //     const model = sensor.dataValues.model;
        //     const manufacturer = sensor.dataValues.manufacturer;
        //     const sensorProperties = await SensorProperty.findAll({ where: { model: model, manufacturer: manufacturer } });
        //     if (!sensorProperties) return reject(new Error("Sensor properties not found"));

        //     if (!properties[manufacturer]) {
        //         properties[manufacturer] = {model: [], properties: []};
        //     }

        //     // add the model to the dict
        //     properties[manufacturer]["model"].push(model);

        //     // add the properties to the dict
        //     const propertyNames = sensorProperties.map((sp) => sp.propertyName);
        //     properties[manufacturer]["properties"].push(propertyNames);
        // }

        // // console.log("properties: ", properties);
        // return resolve(properties);

        // Find properties via DeviceSensorconfiguration

        console.log("in getDeviceProperties");

        const configEntries = await DeviceSensorConfiguration.findAll({
            where: { deviceId },
            attributes: ['sensorProperty', 'sensorType'],
            raw: true
        });
        console.log("configEntries: ", configEntries);

          // extract unique pairs
        const propertyPairs = configEntries.map(entry => ({
        name: entry.sensorProperty,
        sensorType: entry.sensorType
        }));
        console.log("propertyPairs: ", propertyPairs);


        // now get matching Property rows
        const properties = await Property.findAll({
        where: {
            [Op.or]: propertyPairs
        }
        });



        // const properties = await DeviceSensorConfiguration.findAll({
        //     where: { deviceid: deviceId },
        //     include: [
        //       {
        //         model: Property,
        //         as: 'property',
        //       },
        //       {
        //         model: Sensor,
        //         as: 'type',
        //       }
        //     ]
        //   });
        if (!properties) return reject(new Error("Properties not found"));
        console.log("properties: ", properties);
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

export const listUnits = async (): Promise<any> => {
    return new Promise(async (resolve, _) => {
        // const message = {
        //     "command": "list_units",
        //     "timestamp": Date.now()
        // };

        const message = {
            "filterActiveOnly": true,
        }
        const options = { qos: 2 };
        mqtt.publish("interface/listUnits", JSON.stringify(message), options);

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

        const properties = await getSelectedProperties(sessionId, deviceId);
        if (!properties) return reject(new Error("Failed to fetch properties"));

        const deviceProperties = await createPropertyDict(properties, deviceId);
        if (!deviceProperties) return reject(new Error("Failed to create property dictionary"));

        const message = await createConfigMessage(deviceProperties);
        console.log("Message ----------------- : \n", message);

        // Send configuration (selected properties) to gateway
        const options = { qos: 2 };
        mqtt.publish("interface/" + deviceId + "/validateConfiguration", JSON.stringify(message), options);

        const timeout = setTimeout(() => {
            resolve(null);
        }, 5000);

        socket.onmessage = (event) => {
            console.log("Received message from server: ", event.data);
            const data = JSON.parse(event.data.toString());

            if (data.event === "frequency" && data.deviceId === deviceId) {
                console.log("Frequency updated for device: ", data.frequency, data.deviceId);
                clearTimeout(timeout);
                return resolve(data.frequency);
            }
        };
    });
}



export const updateSelectedProperties = async (sessionId: number, deviceId: string, selectedProperties: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // set all properties from device and session to inactive
            const updatedPropertiesFalse = await DeviceSensorConfiguration.update(
                { active: false },
                { where: { sessionId: sessionId, deviceId: deviceId } }
            );
            if (!updatedPropertiesFalse) return reject(new Error("Failed to update properties"));

            for (const p of selectedProperties) {
                if (p.split(":").length === 3) {
                    const { manufacturer, model, propertyName } = splitProperty(p);

                    // set all selected properties to active
                    const updatedPropertyTrue = await DeviceSensorConfiguration.update(
                        { active: true },
                        { where: { sessionId: sessionId, deviceId: deviceId, manufacturer: manufacturer, model: model, propertyName: propertyName } }
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









