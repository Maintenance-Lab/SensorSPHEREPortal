import { Router } from 'express';
import { IS_PROD } from '../../config.js';
import {
    getSessionById,
    createSession,
    addDevices,
    updateSession,
    getSessionsByProject,
    getActiveSessionsByProject,
    getArchivedSessionsByProject,
    deleteSessions
} from '../../services/Sessions.js';
import { getSession } from '../../utils.js';
import Session from '../../models/Session.js';
import AccountProjectMapping from '../../models/mappings/AccountProjectMapping.js';
import SessionDeviceMapping from '../../models/mappings/SessionDeviceMapping.js';
import DeviceSensorConfiguration from '../../models/DeviceSensorConfiguration.js';


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
    console.log("in get active")
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
    console.log("in create api", body);
    const doc = await createSession(body);
    if (!doc) return res.status(400).json({ message: "Failed to create session" });
    return res.json(doc);
});

router.post("/addDevices", async (req, res) => {
    const { body } = req;
    console.log("in add devices", body);
    const doc = await addDevices(body.sessionId, body.deviceIds);
    if (!doc) return res.status(400).json({ message: "Failed to add devices" });
    return res.json(doc);
});

router.put("/update/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { body } = req;

    const response = await getSession(req, res);
    if (!response) return;

    const { account, sessions } = response;
    if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

    const project = await getSessionById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const mapping = await AccountProjectMapping.findOne({ where: { accountId: account.accountId, projectId: project.projectId } });
    if (!mapping) return res.status(401).json({ message: "Unauthorized" });

    const doc = await updateSession(id, body);
    if (!doc) return res.status(400).json({ message: "Failed to update session" });
    return res.json(doc);
});

router.put("/update-many", async (req, res) => {
    console.log("in update many van sessions")
    try {
      const response = await getSession(req, res);
      if (!response) return;

      const { account, sessions } = response;
      const { accountId } = account;

      const { body } = req;
      const toUpdate = [];
      const results = [];

      // create cleaned update body and check if you are the owner
      for (const item of body) {
        const { id, ...rest } = item;
        const cleaned = cleanBody(rest);

        const session: any = await getSessionById(id);
        const projectId = session.projectId;
        if (!projectId) return res.status(404).json({ message: "Project not found" });

        const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: projectId } });
        if (!mapping) return res.status(401).json({ message: "Unauthorized" });

        toUpdate.push({ id, cleaned });
      }

      // Apply updates
      for (const { id, cleaned } of toUpdate) {
        const result = await updateSession(id, cleaned);
        results.push(result);
      }

      return res.json(results);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
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

router.delete("/removeFromSession", async (req, res) => {
    const { sessionId, deviceIds } = req.body;

    try {
      await DeviceSensorConfiguration.destroy({
        where: {
          sessionId: sessionId,
          deviceId: deviceIds,
        },
      });

      await SessionDeviceMapping.destroy({
        where: {
          sessionId: sessionId,
          deviceId: deviceIds,
        },
      });

      return res.status(200).json({ message: "Devices removed successfully" });
    } catch (error) {
      console.error("Error removing devices from session:", error);
      return res.status(500).json({ message: "Failed to remove devices from session" });
    }


});


export default router;

const cleanBody = (body: Partial<Session>) => {
    console.log(body);
    const cleaned = { ...body };
    if (cleaned.meta) delete cleaned.meta;
    if (cleaned.createdAt) delete cleaned.createdAt;
    if (cleaned.projectId) delete cleaned.projectId;
    return cleaned;
  };
