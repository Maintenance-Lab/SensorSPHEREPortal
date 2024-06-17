import { Router } from "express";
import { IS_PROD } from "../../config.js";
import {
  getAllProjects,
  getProjectById,
  getProjectByName,
  getProjectsByAccount,
  createProject,
  createProjects,
  updateProject,
  getArchivedProjectsByOwner,
  getActiveProjectsByOwner,
  deleteProjects,
  getActiveProjectsByAccountId,
  getArchivedProjectsByAccountId,
} from "../../services/Projects.js";
import { getSession } from "../../utils.js";
import { ProjectModel } from "src/models/Project.js";

const router = Router();

/*
TODO:
- Handle auth middleware and check for correct permissions
*/

router.get("/active", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { _id } = account;
  if (!_id) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getActiveProjectsByAccountId(_id);
  return res.json(doc);
});

router.get("/archived", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { _id } = account;
  if (!_id) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getArchivedProjectsByAccountId(_id);
  return res.json(doc);
});

router.get("/id/:id", async (req, res) => {
  try {
    const response = await getSession(req, res);
    if (!response) return;

    const { id } = req.params;
    const doc: any = await getProjectById(id, true);
    if (!doc) return res.status(404).json({ message: "Project not found" });

    // check if user is owner or collaborator
    const { account } = response;
    if (!account) return res.status(401).json({ message: "Unauthorized" });
    const { _id } = account;

    let found = false;
    if (doc.owner?._id.toString() === _id) {
      found = true;
    } else {
      if (doc.collaborators) {
        for (const collab of doc.collaborators) {
          if (collab._id.toString() === _id) {
            found = true;
            break;
          }
        }
      }
    }

    if (!found) return res.status(401).json({ message: "Unauthorized" });
    else return res.json(doc);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// router.get("/account/:accountId", async (req, res) => {
//   if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
//   const { accountId } = req.params;
//   const doc = await getProjectsByAccount(accountId);
//   return res.json(doc);
// });

// router.get("/name/:name", async (req, res) => {
//   if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
//   const { name } = req.params;
//   const doc = await getProjectByName(name);
//   return res.json(doc);
// });

router.post("/create", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { _id } = account;
  if (!_id) return res.status(400).json({ message: "Account ID is required" });

  const { body } = req;
  body.owner = _id;
  const result = await createProject(body);
  return res.json(result);
});

// router.post("/create-many", async (req, res) => {
//   if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
//   const { body } = req;
//   const results = await createProjects(body);
//   return res.json(results);
// });

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { body } = req;

  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { _id } = account;
  const project: any = await getProjectById(id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (project.owner?._id.toString() !== _id) return res.status(401).json({ message: "Unauthorized" });

  const cleaned = cleanBody(body);

  const result = await updateProject(id, cleaned);
  return res.json(result);
});

router.put("/update-many", async (req, res) => {
  try {
    const response = await getSession(req, res);
    if (!response) return;

    const { account, sessions } = response;
    if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

    const { _id } = account;

    const { body } = req;
    const toUpdate = [];
    const results = [];
    // create cleaned update body and check if you are the owner
    for (const item of body) {
      const { id, ...rest } = item;
      const cleaned = cleanBody(rest);

      const project: any = await getProjectById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      if (project.owner?._id.toString() !== _id) return res.status(401).json({ message: "Unauthorized" });

      toUpdate.push({ id, cleaned });
    }

    // Apply updates
    for (const { id, cleaned } of toUpdate) {
      const result = await updateProject(id, cleaned);
      results.push(result);
    }

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/delete", async (req, res) => {
  const { ids } = req.body;
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
  const { _id } = account;

  const project: any = await getProjectById(ids);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (project.owner?._id.toString() !== _id) return res.status(401).json({ message: "Unauthorized" });

  const result = await deleteProjects(ids);
  return res.json(result);
});

export default router;

const cleanBody = (body: Partial<ProjectModel>) => {
  const cleaned = { ...body };
  if (cleaned.meta) delete cleaned.meta;
  if (cleaned.createdAt) delete cleaned.createdAt;
  if (cleaned._id) delete cleaned._id;
  if (cleaned.owner) delete cleaned.owner;
  if (cleaned.collaborators) delete cleaned.collaborators;
  if (cleaned.sensorUnits) delete cleaned.sensorUnits;
  return cleaned;
};
