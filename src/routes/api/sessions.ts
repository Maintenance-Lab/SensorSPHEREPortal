import { Router } from 'express';
import { IS_PROD } from '../../config.js';
import {
    getSessionById,
    createSession,
    updateSession,
    getSessionsByProject,
    getActiveSessionsByProject,
    getArchivedSessionsByProject,
    deleteSessions
} from '../../services/Sessions.js';
import { getSession } from '../../utils.js';
import { Session } from 'inspector';
import AccountProjectMapping from '../../models/mappings/AccountProjectMapping.js';

/* APIS DIE WERKEN - volgens mij (amber)
    /id/:id
    /project/:projectId
    /project/active/:projectId
    /project/archived/:projectId
    /create
    /update/:id
    /delete
 */

const router = Router();

router.get("/id/:id", async (req, res) => {
    console.log("in get session by id");
    const id = Number(req.params.id);
    const doc = await getSessionById(id);
    if (!doc) return res.status(404).json({ message: "Session not found" });
    return res.json(doc);
});

router.get("/project/:projectId", async (req, res) => {
    console.log("in get sessions by project id");
    const projectId = Number(req.params.projectId);
    const doc = await getSessionsByProject(projectId);
    if (!doc) return res.status(404).json({ message: "Project not found" });
    return res.json(doc);
});

router.get("/project/active/:projectId", async (req, res) => {
    console.log("in get active------------------------------")
    const projectId = Number(req.params.projectId);
    console.log("projectId voor de sessions", projectId)
    const doc = await getActiveSessionsByProject(projectId);
    console.log("Sessions van het project", doc)
    if (!doc) return res.status(404).json({ message: "Project not found" });
    return res.json(doc);
});

router.get("/project/archived/:projectId", async (req, res) => {
    const projectId = Number(req.params.projectId);
    const doc = await getArchivedSessionsByProject(projectId);
    if (!doc) return res.status(404).json({ message: "Project not found" });
    return res.json(doc);
});

router.post("/create", async (req, res) => {
    const { body } = req;
    const doc = await createSession(body);
    if (!doc) return res.status(400).json({ message: "Failed to create session" });
    return res.json(doc);
});

router.put("/update/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { body } = req;
    const doc = await updateSession(id, body);
    if (!doc) return res.status(400).json({ message: "Failed to update session" });
    return res.json(doc);
});

router.delete("/delete", async (req, res) => {
    console.log("in delete session");

    const { ids } = req.body;
    const response = await getSession(req, res);
    if (!response) return;

    const { account, sessions } = response;
    if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
    const { accountId } = account;

    // Can contain one or multiple session ids
    const session: any = [];
    for (const id of ids) {
        session.push(await getSessionById(id));
    }

    if (!session) return res.status(404).json({ message: "Project(s) not found" });

    for (const item of session) {
        const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: item.projectId } });
        if (!mapping) return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await deleteSessions(ids);

    return res.json(result);
});

export default router;