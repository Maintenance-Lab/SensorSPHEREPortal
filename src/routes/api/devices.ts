import { Router } from 'express';
import { getDeviceById, getAllDevices, getAllDevicesSession, getDevicesMappedToSession, updateSelectedProperties, getSelectedProperties, sendConfigurationToDevice } from '../../services/Device.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';
import { getDeviceProperties } from '../../services/Device.js';
import Property from '../../models/Property.js';
import DeviceSensorConfiguration from '../../models/DeviceSensorConfiguration.js';
import DeviceModuleMapping from '../../models/mappings/DeviceModuleMapping.js';
import Sensor from '../../models/Sensor.js';
import Module from '../../models/Module.js';
import { listUnits } from '../../services/Device.js';

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
    console.log("in get properties for device");
    const deviceId = req.params.deviceId;
    const doc = await getDeviceProperties(deviceId);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});

router.get("/available/:session", async (req, res) => {
    const sessionId = Number(req.params.session);
    const doc = await getAllDevicesSession(sessionId);
    if (!doc) return res.status(404).json({ message: "Devices not found" });
    return res.json(doc);
});

router.put("/selectedProperties", async (req, res) => {
    const sessionId = Number(req.body.sessionId);
    const deviceId = req.body.deviceId;

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

router.put("/sendConfiguration", async (req, res) => {
    // {
    //     "mac": "XX:XX:XX:XX:XX:XX",
    //     "sensors": [
    //         {
    //             "manufacturer": "M5stack",
    //             "model": "ENV3",
    //             "properties":{
    //                   "humidity",
    //                   "Air pressure",
    //                   "Temperature"
    //             }
    //         }
    //     ]
    // }

    const sessionId = req.body.sessionId;
    const deviceId = req.body.selectedDevice;
    console.log("sendConfiguration: ", sessionId, deviceId);

    await sendConfigurationToDevice(sessionId, deviceId)
    .then((result) => {
        console.log("RESULT: ", result);
        return res.json(result);
    })
    .catch((error) => {
        console.error("Error sending configuration to device: ", error);
        return res.status(500).json({ message: "Failed to send configuration to device" });
    });
});

router.get("/units", async (_, res) => {
    console.log("in units");
    const docs = await listUnits();
    if (!docs) return res.status(404).json({ message: "Units not found" });
    console.log("units: ", docs);
    return res.json(docs);
});




export default router;
