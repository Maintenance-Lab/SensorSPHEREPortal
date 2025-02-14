import { Router } from 'express';
import { getDeviceById, getAllDevices, getAllDevicesSession, getDevicesMappedToSession } from '../../services/Device.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';
import { deviceProperties } from '../../services/Device.js';
import Device from '../../models/Device.js';
import Sensor from '../../models/Sensor.js';
import SensorProperty from '../../models/SensorProperty.js';
import DeviceSensorConfiguration from '../../models/DeviceSensorConfiguration.js';
import DeviceSensorMapping from '../../models/mappings/DeviceSensorMapping.js';

import { Op } from 'sequelize';




const router = Router()

router.get("/all", async (_, res) => {
    console.log("in get all devices");
    const docs = await getAllDevices();
    return res.json(docs);
});

router.get("/all/:session", async (req, res) => {
    // console.log("----- hier moet ie in services get session devices");
    const sessionId = Number(req.params.session);
    console.log("sessionId: ", sessionId);
    const docs = await getDevicesMappedToSession(sessionId);
    // console.log("--------- devices zijn: ", docs);
    if (!docs) return res.status(404).json({ message: "Devices not found" });
    return res.json(docs);
});

router.get("/id/:id", async (req, res) => {
    console.log("in get session by id");
    const id = req.params.id;
    const doc = await getDeviceById(id);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});

router.post("/addToSession", async (req, res) => {
    const { sessionId, deviceIds } = req.body;

    if (!sessionId || !deviceIds || !Array.isArray(deviceIds)) {
        return res.status(400).json({ message: "Invalid input" });
    }

    try {
        const mappings = deviceIds.map((deviceId) => ({
            sessionId,
            deviceId,
        }));

        // TODO: waarom ignoreDuplicates: true?
        const doc = await SessionDeviceMapping.bulkCreate(mappings, { ignoreDuplicates: true });
        if (!doc) return res.status(500).json({ message: "Failed to add devices to session" });

        // add to DeviceSensorConfiguration
        try {
            const sensorsDeviceMappings = await DeviceSensorMapping.findAll({ where: { deviceId: deviceIds } });
            if (!sensorsDeviceMappings) return res.status(404).json({ message: "Sensors not found" });
            console.log("sensorsDeviceMappings: ", sensorsDeviceMappings);

            const sensorProperties = await Promise.all(sensorsDeviceMappings.map(async (sensorMapping) => {
                // Get sensor with device id
                const sensorPropertiesForDevice = await SensorProperty.findAll({
                    where: {
                        model: sensorMapping.dataValues.model,
                        manufacturerName: sensorMapping.dataValues.manufacturerName
                    },
                    attributes: ['propertyName'],
                });

                // Get properties for sensor
                const properties = sensorPropertiesForDevice.map((property) => ({
                    sessionId: sessionId,
                    deviceId: sensorMapping.dataValues.deviceId,
                    model: sensorMapping.dataValues.model,
                    manufacturerName: sensorMapping.dataValues.manufacturerName,
                    propertyName: property.propertyName,
                }));

                return properties;
            }));

            const propertyMappings = sensorProperties.flat();
            const doc = await DeviceSensorConfiguration.bulkCreate(propertyMappings, { ignoreDuplicates: true });
            if (!doc) return res.status(500).json({ message: "Failed to add sensors to session" });
        }
        catch (error) {
            console.error("Error fetching sensor: ", error);
        }

        // TODO: DeviceSensorConfiguration model aanpassen naar model/manufacturernaam ipv property
        // await DeviceSensorConfiguration.bulkCreate(propertyMappings, { ignoreDuplicates: false });

        return res.status(200).json({ message: "Devices added successfully" });
    } catch (error) {
        console.error("Error adding devices to session:", error);
        return res.status(500).json({ message: "Failed to add devices to session" });
    }
});

router.get("/properties/:deviceId", async (req, res) => {
    const deviceId = req.params.deviceId;
    const doc = await deviceProperties(deviceId);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});

router.get("/available/:session", async (req, res) => {
    console.log("in fetch available devices");
    const sessionId = Number(req.params.session);
    const doc = await getAllDevicesSession(sessionId);
    if (!doc) return res.status(404).json({ message: "Devices not found" });
    return res.json(doc);
});

router.put("/selectedProperties", async (req, res) => {
    const sessionId = Number(req.body.sessionId);
    const deviceId = req.body.deviceId;

    try {
        const properties = await DeviceSensorConfiguration.findAll({
            where: { sessionId: sessionId, deviceId: deviceId, active: true },
            attributes: ["sessionId", "deviceId", "propertyName", "active"],
        });

        console.log("Fetched properties:", properties);

        return res.json(properties.length > 0 ? properties : []);
    }   catch (error) {
        console.error("Database query failed:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;
