import { createBaseAccount } from '../utils.js';
import Project from '../models/Project.js';
import AccountProjectMapping from '../models/mappings/AccountProjectMapping.js';
// was import { Project, ProjectModel } from 'src/models/Project.js';
import Account from '../models/Account.js';

/* FUNCTIES DIE WERKEN - volgens mij (amber)
    getAllProjects
    getProjectById
    getActiveProjectsByAccountId
    getArchivedProjectsByAccountId

*/





export const getAllProjects = async () => {
  return new Promise(async (resolve) => {
    const results = await Project.findAll();

    // print all ids
    console.log("ALL PROJECTS: ", results.map((r) => r.projectId));
    return resolve(results);
  });
};

export const getProjectById = async (id: number): Promise<Project> => {
  return new Promise(async (resolve, reject) => {
    console.log("in getProjectById", id);
    const doc = await Project.findByPk(id);
    if (!doc) return reject(new Error("Project not found"));
    return resolve(doc.toJSON());
  });
};

// export const getProjectsByAccount = async (accountId: number) => {
//   return new Promise(async (resolve) => {
//     // const doc = await Project.findAll({ where: { owner: accountId }});
//     const doc = await Project.findAll({ where: {}})
//     return resolve(doc);
//   });
// };

// export const getActiveProjectsByOwner = async (accountId: number) => {
//   return new Promise(async (resolve) => {
//     const doc = await Project.findAll({ where: { owner: accountId, archived: false }});
//     return resolve(doc);
//   });
// };

export const getActiveProjectsByAccountId = async (accountId: number) => {
  // get all accounts where you are the owner or in the collaborators list
  return new Promise(async (resolve) => {

    const doc = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId }, required: true}, where: { archived: false }});

    if (!doc) return resolve([]);
    return resolve(doc);
  });
};

// export const getArchivedProjectsByOwner = async (accountId: number) => {
//   return new Promise(async (resolve) => {
//     const doc = await Project.findAll( {where : { owner: accountId, archived: true }});
//     return resolve(doc);
//   });
// };

export const getArchivedProjectsByAccountId = async (accountId: number) => {
  return new Promise(async (resolve) => {
    const projects = await Project.findAll({include: {model: AccountProjectMapping, where: { accountId: accountId }, required: true}});
    const doc = projects.filter((project) => project.archived === true);
    return resolve(doc);
  });
}

export const getProjectByName = async (name: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.findAll({ where: { name }});
    return resolve(doc);
  });
};

export const createProject = async (item: Partial<Project>, accountId: number) => {
  console.log("IN CREATE PROJECT", item);
  return new Promise(async (resolve) => {
    const result = await Project.create(item);
    const projectId = result.projectId;

    try {
      const finalResult = await AccountProjectMapping.create({ accountId: accountId, projectId: projectId });
      // return finalResult;
      return resolve(finalResult);
    } catch (error) {
      console.log("ERROR: ", error);
    }
    // return resolve(result);
  });
};

export const createProjects = async (items: Array<Partial<Project>>) => {
  return new Promise(async (resolve) => {
    const results = [];
    for (const item of items) {
      const result = await Project.create(item);
      results.push(result);
    }
    return resolve(results);
  });
};

export const updateProject = async (id: number, item: Partial<Project>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("User Key not found"));

    console.log("IN UPDATE PROJECT", id, item);

    const { projectId, ...rest } = item;
    const newItem = { ...rest };
    const query = { projectId: id };

    // const options = {
    //   // Return the document after updates are applied
    //   new: true,
    //   // Create a document if one isn't found.
    //   upsert: false,
    // };
    // const result = await Project.findOneAndUpdate(query, newItem, options);

    const result = await Project.findOne({ where: query});
    if (!result) return reject(new Error("Project not found"));
    result.update(newItem);
    return resolve(result);
  });
};

// export const deleteProject = async (id: string) => {
//   console.log("IN DELETE PROJECT", id);
//   return new Promise(async (resolve) => {
//     const result = await Project.destroy({ where: { id: id }});
//     return resolve(result);
//   });
// };

export const deleteProjects = async (ids: Array<string>) => {
  return new Promise(async (resolve) => {
    const results = [];
    for (const id of ids) {
      //  *** TODO: Review with group if this is the best solution,
      // alternative option: add "ON DELETE CASCADE" to the foreign key in the database ***
      await AccountProjectMapping.destroy({ where: { projectId: id }});
      const result = await Project.destroy({ where: { projectId: id }});
      results.push(result);
    }
    return resolve(results);
  });
};