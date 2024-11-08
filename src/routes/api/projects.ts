import { Router } from 'express';
import { IS_PROD } from '../../config.js';
import {
  getAllProjects,
  getProjectById,
  getProjectByName,
  // getProjectsByAccount,
  createProject,
  createProjects,
  updateProject,
  // getArchivedProjectsByOwner,
  deleteProjects,
  getActiveProjectsByAccountId,
  getArchivedProjectsByAccountId,
} from '../../services/Projects.js';
import { getAccountById } from '../../services/Account.js';
import { getSession } from '../../utils.js';
import Project from '../../models/Project.js';
import AccountProjectMapping from '../../models/mappings/AccountProjectMapping.js';

const router = Router();

/* APIS DIE WERKEN - volgens mij (amber)
    /active
    /all
    /archived
    /id/:projectId
    /create
    /latest
    /update/:id
    /update-many

 */




/*
TODO:
- Handle auth middleware and check for correct permissions
*/

router.get("/active", async (req, res) => {
  console.log("in get active")
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;
  if (!accountId) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getActiveProjectsByAccountId(accountId);

  return res.json(doc);
});

router.get("/all", async (req, res) => {
  console.log("in get all")
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });

  const doc = await getAllProjects();
  return res.json(doc);
});

router.get("/archived", async (req, res) => {
  console.log("in get archived")
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;
  if (!accountId) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getArchivedProjectsByAccountId(accountId);
  return res.json(doc);
});

router.get("/id/:projectId", async (req, res) => {
  console.log("in get id")
  try {
    const response = await getSession(req, res);
    if (!response) return;

    const id = Number(req.params.projectId);
    const doc: any = await getProjectById(id);
    if (!doc) return res.status(404).json({ message: "Project not found" });

    const { account } = response;
    if (!account) return res.status(401).json({ message: "Unauthorized" });

    const mapping = await AccountProjectMapping.findOne({ where: { accountId: account.accountId, projectId: id } });
    if (!mapping) return res.status(401).json({ message: "Unauthorized" });

    return res.json(doc);
  }
  catch (error) {
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
  console.log("in create project")
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;
  if (!accountId) return res.status(400).json({ message: "Account ID is required" });

  const { body } = req;
  const result = await createProject(body, accountId);

  return res.json(result);
});

// router.post("/create-many", async (req, res) => {
//   if (IS_PROD) return res.status(403).json({ message: "This server has not been setup for production yet" });
//   const { body } = req;
//   const results = await createProjects(body, accountId);
//   return res.json(results);
// });

router.get("/latest", async (req, res) => {
  console.log("in latest")
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.accountId) return res.status(400).json({ message: "Account ID is required" });

  const projects = await getActiveProjectsByAccountId(account.accountId) as Project[];

  // sort by createdAt date, most recent first
  const sortedProjects = projects.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const latestProjects = sortedProjects.map((project) => project.projectId);

  return res.json(latestProjects.slice(0, Math.min(4, sortedProjects.length)));
});

router.put("/update/:id", async (req, res) => {
  console.log("in update project ")
  const id = Number(req.params.id);
  const { body } = req;

  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;

  const project: any = await getProjectById(id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  const mapping = await AccountProjectMapping.findOne({ where: { accountId, projectId: id } });
  if (!mapping) return res.status(401).json({ message: "Unauthorized" });

  const cleaned = cleanBody(body);

  const result = await updateProject(id, cleaned);
  return res.json(result);
});

router.put("/update-many", async (req, res) => {
  console.log("in update many")
  try {
    const response = await getSession(req, res);
    if (!response) return;

    const { account, sessions } = response;
    if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

    const { accountId } = account;

    const { body } = req;
    const toUpdate = [];
    const results = [];
    // create cleaned update body and check if you are the owner
    for (const item of body) {
      const { id, ...rest } = item;
      const cleaned = cleanBody(rest);

      const project: any = await getProjectById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const mapping = await AccountProjectMapping.findOne({ where: { accountId, projectId: id } });
      if (!mapping) return res.status(401).json({ message: "Unauthorized" });

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
  console.log("in delete project")
  const { ids } = req.body;
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
  const { accountId } = account;

  // Can contain one or multiple project ids
  const project: any = [];
  for (const id of ids) {
    project.push(await getProjectById(id));
  }

  // const project: any = await getProjectById(ids);
  if (!project) return res.status(404).json({ message: "Project(s) not found" });

  // if (project.owner?._id.toString() !== accountId) return res.status(401).json({ message: "Unauthorized" });

  // ids can be one or multiple project ids
  const result = await deleteProjects(ids);

  return res.json(result);
});

export default router;

const cleanBody = (body: Partial<Project>) => {
  console.log(body);
  const cleaned = { ...body };
  if (cleaned.meta) delete cleaned.meta;
  if (cleaned.createdAt) delete cleaned.createdAt;
  if (cleaned.projectId) delete cleaned.projectId;
  // if (cleaned.Owner) delete cleaned.Owner;
  return cleaned;
};
