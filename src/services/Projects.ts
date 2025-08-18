import Project from '../models/Project.js';
import AccountProjectMapping from '../models/mappings/AccountProjectMapping.js';
import { getSessionsByProject } from './Sessions.js';
import { deleteSessions } from './Sessions.js';
import Session from 'src/models/Session.js';

/* FUNCTIES DIE WERKEN - volgens mij (amber)
    getAllProjects
    getProjectById
    getActiveProjectsByAccountId
    getArchivedProjectsByAccountId
    createProject
    deleteProjects
    deleteProjectsForAll
*/

export const getAllProjects = async () => {
  const results = await Project.findAll();
  if (!results) return [];
  return results;
};

export const getProjectById = async (id: number): Promise<Project> => {
  const doc = await Project.findByPk(id);
  if (!doc) throw new Error("Project not found");
  return doc.toJSON();
};

export const getProjectsByAccountId = async (accountId: number) => {
  const doc = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId }, required: true }});
  if (!doc) return [];

  return doc;
}

export const getActiveProjectsByAccountId = async (accountId: number) => {
  const doc = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId, status: 'active' }, required: true}});
  if (!doc) return [];

  return doc;
};

export const getArchivedProjectsByAccountId = async (accountId: number) => {
  const doc = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId, status: 'archived' }, required: true}});
  if (!doc) return [];

  return doc;
};

export const getPendingProjectsByAccountId = async (accountId: number) => {
  const doc = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId, status: 'pending' }, required: true}});
  if (!doc) return [];

  return doc;
}

export const createProject = async (item: Partial<Project>, accountId: number) => {
  console.log("'in createProject", item, accountId);
  const result = await Project.create(item);
  const projectId = result.projectId;

  try {
    const finalResult = await AccountProjectMapping.create({ accountId: accountId, projectId: projectId });
    return finalResult;
  } catch (error) {
    throw new Error("Error creating project mapping");
  }
};

// DEZE MOET MISSCHIEN GEBRUIKT WORDEN VOOR EEN ADMIN, NOG NIET NAAR GEKEKEN
// export const createProjects = async (items: Array<Partial<Project>>) => {
//   return new Promise(async (resolve) => {
//     const results = [];
//     for (const item of items) {
//       const result = await Project.create(item);
//       results.push(result);
//     }
//     return resolve(results);
//   });
// };

export const updateProject = async (id: number, item: Partial<Project>) => {
  console.log("in update project", id, item);
  if (!id) throw new Error("User Key not found");

  const { projectId, ...rest } = item;
  const newItem = { ...rest };
  newItem.lastActive = new Date();

  const result = await Project.findOne({ where: { projectId: id }});
  if (!result) throw new Error("Project not found");
  result.update(newItem);
  return result;
};

export const updateAccountProjectMapping = async (accountId: number, projectId: number, status: string) => {
  const mapping = await AccountProjectMapping.findOne({ where: { accountId: accountId, projectId: projectId }});
  if (!mapping) throw new Error("Mapping not found");
  mapping.update({ status: status });
  return mapping;
}

export const deleteProjects = async (ids: Array<number>, accountId: number) => {
  const results = [];
  for (const id of ids) {
    //  *** TODO: Review with group if this is the best solution,
    // alternative option: add "ON DELETE CASCADE" to the foreign key in the database ***

    const mappings = await AccountProjectMapping.findAll({ where: { projectId: id }});
    if (!mappings) return [];

    await AccountProjectMapping.destroy({ where: { projectId: id, accountId: accountId }});

    // if project is not linked to any other account or only pending projects exist, delete project
    if (mappings.length == 1 || mappings.every((m) => m.status == 'pending')) {
      // delete sessions
      const sessions = [];
      for (const id of ids) {
        const doc = await getSessionsByProject(id) as Session[];
        sessions.push(...doc.map((s) => s.dataValues.sessionId));
      }

      await deleteSessions(sessions);
      const result = await Project.destroy({ where: { projectId: id }});
      results.push(result);
    }
  }

  return results;
}

// for future use maybe
export const deleteProjectsForAll = async (ids: Array<number>) => {
  const results = [];
  for (const id of ids) {
    //  *** TODO: Review with group if this is the best solution,
    // alternative option: add "ON DELETE CASCADE" to the foreign key in the database ***

    // delete sessions
    const sessions = [];
    for (const id of ids) {
      const doc = await getSessionsByProject(id) as Session[];
      sessions.push(...doc.map((s) => s.dataValues.sessionId));
    }

    await deleteSessions(sessions);

    await AccountProjectMapping.destroy({ where: { projectId: id}});
    const result = await Project.destroy({ where: { projectId: id }});
    results.push(result);
  }

  return results;
};