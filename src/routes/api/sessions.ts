import { Router } from 'express';
import { IS_PROD } from '../../config.js';
import {
    getSessionById,
    createSession,
    updateSession,
    getSessionsByProject,
    getActiveSessionsByProject,
    getArchivedSessionsByProject,
    deleteSession
} from '../../services/Sessions.js';

const router = Router();

router.get("/id/:id", async (req, res) => {
    const id = Number(req.params.id);
    console.log("id", req.params.id);
    const doc = await getSessionById(id);
    return res.json(doc);
});

router.get("/project/:projectId", async (req, res) => {
    const projectId = Number(req.params.projectId);
    console.log("project id in api", projectId);
    const doc = await getSessionsByProject(projectId);
    console.log("doc", doc);
    return res.json(doc);
});

router.get("/project/active/:projectId", async (req, res) => {
    const projectId = Number(req.params.projectId);
    const doc = await getActiveSessionsByProject(projectId);
    return res.json(doc);
});

router.get("/project/archived/:projectId", async (req, res) => {
    const projectId = Number(req.params.projectId);
    const doc = await getArchivedSessionsByProject(projectId);
    return res.json(doc);
});

router.post("/create", async (req, res) => {
    const { body } = req;
    const doc = await createSession(body);
    console.log("dit wordt gereturnd", doc);
    return res.json(doc);
});

router.put("/update/:id", async (req, res) => {
    const id = Number(req.params);
    const { body } = req;
    const doc = await updateSession(id, body);
    return res.json(doc);
});

router.delete("/delete/:id", async (req, res) => {
    const id = Number(req.params);
    const doc = await deleteSession(id);
    return res.json(doc);
});

export default router;