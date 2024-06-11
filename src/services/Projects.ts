import { createBaseAccount } from "../utils.js";
import Project, { ProjectModel } from "../models/Project.js";
import { AccountModel } from "../models/Account.js";

export const getAllProjects = async () => {
  return new Promise(async (resolve) => {
    const results = await Project.find({});
    return resolve(results);
  });
};

export const getProjectById = async (id: string, populate = false): Promise<ProjectModel> => {
  return new Promise(async (resolve, reject) => {
    const doc = await Project.findById(id).populate(populate ? "collaborators owner" : "");
    if (!doc) return reject(new Error("Project not found"));
    const returnDoc = doc.toObject();

    if (populate) {
      returnDoc.owner = createBaseAccount(doc.owner);
      if (returnDoc.collaborators)
        returnDoc.collaborators = returnDoc.collaborators.map((c: AccountModel) => createBaseAccount(c));
    }

    return resolve(returnDoc);
  });
};

export const getProjectsByAccount = async (accountId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.find({ owner: accountId });
    return resolve(doc);
  });
};

export const getActiveProjectsByOwner = async (accountId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.find({ owner: accountId, archived: false });
    return resolve(doc);
  });
};

export const getArchivedProjectsByOwner = async (accountId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.find({ owner: accountId, archived: true });
    return resolve(doc);
  });
};

export const getProjectByName = async (name: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.find({ name });
    return resolve(doc);
  });
};

export const createProject = async (item: Partial<ProjectModel>) => {
  return new Promise(async (resolve) => {
    const result = await Project.create(item);
    return resolve(result);
  });
};

export const createProjects = async (items: Array<Partial<ProjectModel>>) => {
  return new Promise(async (resolve) => {
    const results = [];
    for (const item of items) {
      const result = await Project.create(item);
      results.push(result);
    }
    return resolve(results);
  });
};

export const updateProject = async (id: string, item: Partial<ProjectModel>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("User Key not found"));

    const { _id, ...rest } = item;

    const newItem = { ...rest };

    const query = { _id: id };
    const options = {
      // Return the document after updates are applied
      new: true,
      // Create a document if one isn't found.
      upsert: false,
    };
    const result = await Project.findOneAndUpdate(query, newItem, options);
    return resolve(result);
  });
};

export const deleteProjects = async (id: Array<string>) => {
  return new Promise(async (resolve) => {
    const result = await Project.deleteMany({ _id: { $in: id } });
    return resolve(result);
  });
};
