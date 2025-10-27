import { Router } from 'express';
import { IS_PROD } from '../../config.js';
import {
  getAllProjects,
  getProjectById,
  // getProjectsByAccount,
  createProject,
  updateProject,
  // getArchivedProjectsByOwner,
  deleteProjects,
  deleteProjectsForAll,
  getActiveProjectsByAccountId,
  getArchivedProjectsByAccountId,
} from '../../services/projects.js';
import { getAccountById } from '../../services/account.js';
import { getSession } from '../../utils.js';
import Project from '../../models/Project.js';
import AccountProjectMapping from '../../models/mappings/AccountProjectMapping.js';
import { arch } from 'os';
import { getPendingProjectsByAccountId } from '../../services/projects.js';

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
    /delete

    ALLES IS GEDAAN
 */

/*
TODO:
- Handle auth middleware and check for correct permissions
*/

router.post("/accept", async (req, res) => {
  console.log("in accept")
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;
  if (!accountId) return res.status(400).json({ message: "Account ID is required" });

  const { body } = req;
  const { projectId } = body;

  const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: projectId, status: "pending" } });
  if (!mapping) return res.status(401).json({ message: "Unauthorized" });

  await mapping.update({ status: "active" });

  return res.json({ message: "Accepted" });
});

router.get("/active", async (req, res) => {
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
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });

  const doc = await getAllProjects();
  return res.json(doc);
});

router.get("/archived", async (req, res) => {
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

router.post("/decline", async (req, res) => {
  console.log("in decline")
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  const { accountId } = account;
  if (!accountId) return res.status(400).json({ message: "Account ID is required" });

  const { body } = req;
  const { projectId } = body;

  const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: projectId } });
  if (!mapping) return res.status(401).json({ message: "Unauthorized" });

  // delete mapping
  await mapping.destroy();

  return res.json({ message: "Declined" });
});

router.get("/latest", async (req, res) => {
  console.log("in latest")
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.accountId) return res.status(400).json({ message: "Account ID is required" });

  const projects = await getActiveProjectsByAccountId(account.accountId) as Project[];

  // sort by lastActive date, most recent first
  const sortedProjects = projects.sort((a, b) => {
    const dateA = new Date(a.lastActive);
    const dateB = new Date(b.lastActive);
    return dateB.getTime() - dateA.getTime();
  });

  const latestProjects = sortedProjects.map((project) => project.projectId);

  return res.json(latestProjects.slice(0, Math.min(6, sortedProjects.length)));
});

router.get("/pending", async (req, res) => {
  console.log("in pending")
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.accountId) return res.status(400).json({ message: "Account ID is required" });

  const projects = await getPendingProjectsByAccountId(account.accountId);
  if (!projects) return res.status(404).json({ message: "No pending projects found" });

  return res.json(projects);
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

  // if archived in body, update mapping status
  if ('archived' in cleaned) {
    await mapping.update({ status: cleaned.archived ? "archived" : "active" });
    delete cleaned.archived;
  }

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
      const mapping = await AccountProjectMapping.findOne({ where: { accountId, projectId: id } });
      if (!mapping) return res.status(401).json({ message: "Unauthorized" });

      // if archived in body, update mapping status
      if ('archived' in cleaned) {
        await mapping.update({ status: cleaned.archived ? "archived" : "active" });
        delete cleaned.archived;
      }

      if (Object.keys(cleaned).length !== 0) {
        const result = await updateProject(id, cleaned);
        results.push(result);
      }

      console.log("Project updated/pushed")
    }

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// // TODO: NOG NAAR KIJKEN
// router.put("/update-mapping/:projectIds", async (req, res) => {
//   console.log("in update mapping")
//   try {
//     const response = await getSession(req, res);
//     if (!response) return;

//     const { account, sessions } = response;
//     if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

//     const { accountId } = account;
//     const { projectIds } = req.params;
//     const { status } = req.body;
//     console.log("Status in update mapping", status);

//     for (const id of projectIds) {
//       const mapping = await AccountProjectMapping.findOne({ where: { accountId, id } });
//       if (!mapping) return res.status(401).json({ message: "Unauthorized" });

//       mapping.update({ status: status });
//     }

//     return res.json({ message: "Updated" });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });

router.post("/delete", async (req, res) => {
  const { ids } = req.body;
  console.log("in delete project ", ids);
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
  const accountId : number = account.accountId!;

  // Can contain one or multiple project ids
  const project: any = [];
  for (const id of ids) {
    project.push(await getProjectById(id));
  }

  if (!project) return res.status(404).json({ message: "Project(s) not found" });

  for (const item of project) {
    const mapping = await AccountProjectMapping.findOne({ where: { accountId, projectId: item.projectId } });
    if (!mapping) return res.status(401).json({ message: "Unauthorized" });
  }

  // ids can be one or multiple project ids
  const result = await deleteProjects(ids, accountId);
  return res.json(result);
});

router.post("/delete-for-all", async (req, res) => {
  const { ids } = req.body;
  console.log("in delete for all ", ids)

  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });
  const accountId : number = account.accountId!;

  for (const id of ids) {
    const mapping = await AccountProjectMapping.findOne({ where: { accountId, projectId: id } });
    if (!mapping) return res.status(401).json({ message: "Unauthorized" });
  }

  // ids can be one or multiple project ids
  const result = await deleteProjectsForAll(ids);
  return res.json(result);
});

export default router;

const cleanBody = (body: Partial<Project>) => {
  console.log(body);
  const cleaned = { ...body };
  if (cleaned.meta) delete cleaned.meta;
  if (cleaned.createdAt) delete cleaned.createdAt;
  if (cleaned.projectId) delete cleaned.projectId;
  return cleaned;
};
