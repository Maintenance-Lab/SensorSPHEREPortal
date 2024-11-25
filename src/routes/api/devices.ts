import { Router } from 'express';
import { getDeviceById, getAllDevices } from '../../services/Device.js';

const router = Router();

router.get("/all", async (_, res) => {
    console.log("in get all devices");
    const docs = await getAllDevices();
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
