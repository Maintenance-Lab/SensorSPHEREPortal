import { Router } from 'express';
import { getDeviceById, getAllDevices, getAllDevicesSession, getDevicesMappedToSession } from '../../services/Device.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';
const router = Router()

router.get("/all", async (_, res) => {
    console.log("in get all devices");
    const docs = await getAllDevices();
    return res.json(docs);
});

router.get("/all/:session", async (req, res) => {
    console.log("----- hier moet ie in services get session devices");
    const sessionId = Number(req.params.session);
    console.log("sessionId: ", sessionId);
    const docs = await getDevicesMappedToSession(sessionId);
    console.log("--------- devices zijn: ", docs);
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

        await SessionDeviceMapping.bulkCreate(mappings, { ignoreDuplicates: true });

        return res.status(200).json({ message: "Devices added successfully" });
    } catch (error) {
        console.error("Error adding devices to session:", error);
        return res.status(500).json({ message: "Failed to add devices to session" });
    }
});

router.get("/available/:session", async (req, res) => {
    console.log("in fetch available devices");
    const sessionId = Number(req.params.session);
    const doc = await getAllDevicesSession(sessionId);
    return res.json(doc);
});



export default router;
