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

 */


const router = Router();

router.get("/id/:id", async (req, res) => {
    console.log("in get session by id");
    const id = Number(req.params.id);
    const doc = await getSessionById(id);
    return res.json(doc);
});

router.get("/project/:projectId", async (req, res) => {
    console.log("in get sessions by project id");
    const projectId = Number(req.params.projectId);
    const doc = await getSessionsByProject(projectId);
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
    const id = Number(req.params.id);
    const { body } = req;
    const doc = await updateSession(id, body);
    return res.json(doc);
});

router.delete("/delete", async (req, res) => {
    console.log("in delete session");

    // // aanpassen naar meer?
    // const id = Number(req.params.id);
    // const doc = await deleteSessions([id]);

    const { ids } = req.body;
    console.log("ids om te verwijderen", ids);
    const response = await getSession(req, res);
    if (!response) return;

    const { account, sessions } = response;
    if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
    const { accountId } = account;

    // Can contain one or multiple session ids
    const session: any = [];
    for (const id of ids) {
        console.log("ID", id);
        session.push(await getSessionById(id));
    }
    console.log("SESSION", session);

    if (!session) return res.status(404).json({ message: "Project(s) not found" });

    console.log("projects found", session);

    for (const item of session) {
        console.log("ITEM", item);
        const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: item.projectId } });
        if (!mapping) return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("authorized");

    // ids can be one or multiple project ids
    const result = await deleteSessions(ids);

    console.log("PROJECTS DELETED -----------------")
    // const result = null;

    return res.json(result);
});

export default router;