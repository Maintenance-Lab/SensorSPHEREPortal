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
import { getSession } from '../../utils.js';
import Project from '../../models/Project.js';

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

  const { AccountId } = account;
  if (!AccountId) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getActiveProjectsByAccountId(AccountId);
  return res.json(doc);
});

router.get("/archived", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { AccountId } = account;
  if (!AccountId) return res.status(400).json({ message: "Account ID is required" });

  const doc = await getArchivedProjectsByAccountId(AccountId);
  return res.json(doc);
});

router.get("/id/:id", async (req, res) => {
  try {
    const response = await getSession(req, res);
    if (!response) return;

    const id = Number(req.params);
    // const doc: any = await getProjectById(id, true);
    const doc: any = await getProjectById(id);
    if (!doc) return res.status(404).json({ message: "Project not found" });

    // // check if user is owner or collaborator
    // const { account } = response;
    // if (!account) return res.status(401).json({ message: "Unauthorized" });
    // const { _id } = account;

    // let found = false;
    // if (doc.owner?._id.toString() === _id) {
    //   found = true;
    // } else {
    //   if (doc.collaborators) {
    //     for (const collab of doc.collaborators) {
    //       if (collab._id.toString() === _id) {
    //         found = true;
    //         break;
    //       }
    //     }
    //   }
    // }

    // if (!found) return res.status(401).json({ message: "Unauthorized" });
    // else return res.json(doc);
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
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { AccountId } = account;
  if (!AccountId) return res.status(400).json({ message: "Account ID is required" });

  const { body } = req;
  // body.owner = AccountId;
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
  const id = Number(req.params);
  const { body } = req;

  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { AccountId } = account;
  const project: any = await getProjectById(id);
  if (!project) return res.status(404).json({ message: "Project not found" });

  if (project.owner?._id.toString() !== AccountId) return res.status(401).json({ message: "Unauthorized" });

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

    const { AccountId } = account;

    const { body } = req;
    const toUpdate = [];
    const results = [];
    // create cleaned update body and check if you are the owner
    for (const item of body) {
      const { id, ...rest } = item;
      const cleaned = cleanBody(rest);

      const project: any = await getProjectById(id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      // if (project.owner?._id.toString() !== AccountId) return res.status(401).json({ message: "Unauthorized" });

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
  const { AccountId } = account;

  const project: any = await getProjectById(ids);
  if (!project) return res.status(404).json({ message: "Project not found" });

  // if (project.owner?._id.toString() !== AccountId) return res.status(401).json({ message: "Unauthorized" });

  const result = await deleteProjects(ids);
  return res.json(result);
});

export default router;

const cleanBody = (body: Partial<Project>) => {
  console.log(body);
  const cleaned = { ...body };
  if (cleaned.Meta) delete cleaned.Meta;
  if (cleaned.CreatedAt) delete cleaned.CreatedAt;
  if (cleaned.ProjectId) delete cleaned.ProjectId;
  // if (cleaned.Owner) delete cleaned.Owner;
  return cleaned;
};
