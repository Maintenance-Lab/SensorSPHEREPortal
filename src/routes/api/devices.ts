import { Router } from 'express';
import { getDeviceById, getAllDevices, getAllDevicesSession } from '../../services/Device.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';

const router = Router();

router.get("/all", async (_, res) => {
    console.log("in get all devices");
    const docs = await getAllDevices();
    return res.json(docs);
});

router.get("/all/:session", async (req, res) => {
    console.log("in get all devices");
    const sessionId = Number(req.params.session);
    console.log("sessionId: ", sessionId);
    const docs = await getAllDevicesSession(sessionId);

    if (!docs) return res.status(404).json({ message: "Devices not found" });
    return res.json(docs);
});

router.get("/id/:id", async (req, res) => {
    console.log("in get session by id");
    const id = Number(req.params.id);
    const doc = await getDeviceById(id);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});

export default router;
