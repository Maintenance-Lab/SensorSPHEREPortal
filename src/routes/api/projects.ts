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
  deleteProjects
} from "../../services/Projects.js";
import { getSession } from "../../utils.js";

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

  const doc = await getActiveProjectsByOwner(_id);
  return res.json(doc);
});

router.get("/archived", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { _id } = account;
  if (!_id) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getArchivedProjectsByOwner(_id);
  return res.json(doc);
});

router.get("/id/:id", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { id } = req.params;
  const doc = await getProjectById(id);
  return res.json(doc);
});

router.get("/account/:accountId", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { accountId } = req.params;
  const doc = await getProjectsByAccount(accountId);
  return res.json(doc);
});

router.get("/name/:name", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { name } = req.params;
  const doc = await getProjectByName(name);
  return res.json(doc);
});

router.post("/create", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });

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

router.post("/create-many", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { body } = req;
  const results = await createProjects(body);
  return res.json(results);
});

router.put("/update/:id", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { id } = req.params;
  const { body } = req;
  const result = await updateProject(id, body);
  return res.json(result);
});

router.put("/update-many", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { body } = req;
  const results = [];
  for (const item of body) {
    const { id } = item;
    const result = await updateProject(id, item);
    results.push(result);
  }
  return res.json(results);
});

router.post("/delete", async (req, res) => {
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const { ids } = req.body;
  const result = await deleteProjects(ids);
  return res.json(result);
});

export default router;
