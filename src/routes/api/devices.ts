import { Router } from 'express';
import { getDeviceById, getAllDevices, getAllAvailableDevicesSession, getDevicesMappedToSession, updateSelectedProperties, getSelectedProperties, sendConfigurationToDevice,
    getSampleRate, saveSampleRate, sendStartBatch, sendStopBatch } from '../../services/Device.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';
import { getDeviceProperties } from '../../services/Device.js';
import Property from '../../models/Property.js';
import DeviceSensorConfiguration from '../../models/DeviceSensorConfiguration.js';
import DeviceModuleMapping from '../../models/mappings/DeviceModuleMapping.js';
import Sensor from '../../models/Sensor.js';
import Module from '../../models/Module.js';
import { listUnits } from '../../services/Device.js';
import Session from 'src/models/Session.js';

const router = Router()

router.get("/all", async (_, res) => {
    const docs = await getAllDevices();
    return res.json(docs);
});

router.get("/all/:session", async (req, res) => {
    const sessionId = Number(req.params.session);
    const docs = await getDevicesMappedToSession(sessionId);
    if (!docs) return res.status(404).json({ message: "Devices not found" });
    return res.json(docs);
});

router.get("/id/:id", async (req, res) => {
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

        const doc = await SessionDeviceMapping.bulkCreate(mappings, { ignoreDuplicates: false });
        if (!doc) return res.status(500).json({ message: "Bulk mapping failed;Some devices might already be added" });

        const deviceSensorConfigs = [];

        // add to DeviceSensorConfiguration
        try {
            const sensorsDeviceMappings = await DeviceModuleMapping.findAll({ where: { deviceId: deviceIds } });
            if (!sensorsDeviceMappings) return res.status(404).json({ message: "Sensors not found" });
            try {
                for (const sensorMapping of sensorsDeviceMappings) {
                    const { deviceId, sensorType } = sensorMapping.dataValues;

                    // Get matching Property entries
                    const properties = await Property.findAll({
                      where: { sensorType }, // assuming 'sensorType' column in Property
                      attributes: ['name', 'sensorType']
                    });

                    // Map each property to a config row
                    const configs = properties.map((prop) => ({
                      sessionId: sessionId,
                      deviceId: deviceId,
                      sensorProperty: prop.name,
                      sensorType: prop.sensorType
                    }));

                    deviceSensorConfigs.push(...configs);
                  }
            }
            catch (error) {
                console.error("Error fetching properties: ", error);
                return res.status(500).json({ message: "Error fetching properties" });
            }
        }
        catch (error) {
            console.error("Error fetching sensor: ", error);
        }
        // Bulk create the DeviceSensorConfiguration entries
        await DeviceSensorConfiguration.bulkCreate(deviceSensorConfigs, { ignoreDuplicates: true });

        return res.status(200).json({ message: "Devices added successfully" });
    } catch (error) {
        console.error("Error adding devices to session:", error);
        return res.status(500).json({ message: "Bulk mapping failed;Some devices might already be added" });
    }
});

router.get("/properties/:deviceId", async (req, res) => {
    const deviceId = req.params.deviceId;
    const doc = await getDeviceProperties(deviceId);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});

router.get("/available/:session", async (req, res) => {
    const sessionId = Number(req.params.session);
    const doc = await getAllAvailableDevicesSession(sessionId);
    if (!doc) return res.status(404).json({ message: "Devices not found" });
    return res.json(doc);
});

router.get("/selectedProperties/:sessionId/:deviceId", async (req, res) => {
    const sessionId = Number(req.params.sessionId);
    const deviceId = req.params.deviceId;

    const doc = await getSelectedProperties(sessionId, deviceId);
    if (!doc) return res.status(500).json({ message: "Failed to fetch properties" });
    return res.json(doc);
});

router.put("/updateSelectedProperties", async (req, res) => {
    const sessionId = Number(req.body.sessionId);
    const deviceId = req.body.deviceId;
    const selectedProperties = req.body.selectedProperties;

    const doc = await updateSelectedProperties(sessionId, deviceId, selectedProperties);
    if (!doc) return res.status(500).json({ message: "Failed to update properties" });
    return res.json(doc);
});

router.get("/getSampleRate/:sessionId/:deviceId", async (req, res) => {
    const sessionId = Number(req.params.sessionId);
    const deviceId = req.params.deviceId;

    const doc = await getSampleRate(sessionId, deviceId);
    if (doc === null) {
        return res.json(null)
    }
    return res.json(doc);
});

router.put("/saveSampleRate", async (req, res) => {
    const sessionId = Number(req.body.sessionId);
    const deviceId = req.body.deviceId;
    const sampleRate = req.body.sampleRate;

    const doc = await saveSampleRate(sessionId, deviceId, sampleRate);
    if (!doc) return res.status(500).json({ message: "Failed to update sample rate" });
    return res.json(doc);
});

router.put("/sendConfiguration", async (req, res) => {
    const sessionId = req.body.sessionId;
    const deviceId = req.body.selectedDevice;

    await sendConfigurationToDevice(sessionId, deviceId)
    .then((result) => {
        return res.json(result);
    })
    .catch((error) => {
        console.error("Error sending configuration to device: ", error);
        return res.status(500).json({ message: "Failed to send configuration to device" });
    });
});

router.get("/units", async (_, res) => {
    const docs = await listUnits();
    if (!docs) return res.status(404).json({ message: "Units not found" });
    return res.json(docs);
});


router.put("/startBatch", async (req, res) => {
    const sessionId = req.body.sessionId;

    const doc = await sendStartBatch(sessionId);
    if (!doc) return res.status(500).json({ message: "Failed to start batch" });
    return res.json(doc);
});

router.put("/stopBatch", async (req, res) => {
    const sessionId = req.body.sessionId;
    const doc = await sendStopBatch(sessionId);
    if (!doc) return res.status(500).json({ message: "Failed to stop batch" });
    return res.json(doc);
});

export default router;
