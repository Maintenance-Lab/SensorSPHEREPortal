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
} from "../../services/Projects.js";

const router = Router();

/*
TODO:
- Handle auth middleware and check for correct permissions
*/

router.get("/all", async (_, res) => {
  // remove when auth is implemented
  if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
  const results = await getAllProjects();
  return res.json(results);
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
  const { body } = req;
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

export default router;
