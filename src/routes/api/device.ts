import { Router } from 'express';
import { getDeviceById } from 'src/services/Device';

const router = Router();

router.get("/id/:id", async (req, res) => {
    console.log("in get session by id");
    const id = Number(req.params.id);
    const doc = await getDeviceById(id);
    if (!doc) return res.status(404).json({ message: "Device not found" });
    return res.json(doc);
});