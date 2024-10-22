import { createBaseAccount } from '../utils.js';
import Project from '../models/Project.js';
// was import { Project, ProjectModel } from 'src/models/Project.js';
import Account from '../models/Account.js';

export const getAllProjects = async () => {
  return new Promise(async (resolve) => {
    const results = await Project.findAll();
    return resolve(results);
  });
};

export const getProjectById = async (id: number): Promise<Project> => {
// export const getProjectById = async (id: number, populate = false): Promise<Project> => {
  return new Promise(async (resolve, reject) => {
    // const doc = await Project.findByPk(id, { include: populate ? ["Owner"] : [] });
    console.log("in getProjectById", id);
    const doc = await Project.findByPk(id)
    if (!doc) return reject(new Error("Project not found"));
    const returnDoc = doc.toJSON();

    // if (populate) {
    //   returnDoc.Owner = createBaseAccount(doc.Owner);
      // if (returnDoc.collaborators)
      //   returnDoc.collaborators = returnDoc.collaborators.map((c: Account) => createBaseAccount(c));
    // }

    return resolve(returnDoc);
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
    // const doc = await Project.findAll( { where : { $or: [{ owner: accountId }], archived: false }});
    const doc = await Account.findOne({ where: { AccountId: accountId}, include: { model: Project, where: {archived: false}}})
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
    const doc = await Project.findAll({ where: { $or: [{ AccountId: accountId }], archived: true }});
    return resolve(doc);
  });
}

export const getProjectByName = async (name: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.findAll({ where: { name }});
    return resolve(doc);
  });
};

export const createProject = async (item: Partial<Project>) => {
  console.log("IN CREATE PROJECT", item);
  return new Promise(async (resolve) => {
    const result = await Project.create(item);
    return resolve(result);
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
    const query = { projectId: projectId };

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

export const deleteProjects = async (id: Array<string>) => {
  return new Promise(async (resolve) => {
    const result = await Project.destroy({ where: { id: id }});
    return resolve(result);
  });
};
