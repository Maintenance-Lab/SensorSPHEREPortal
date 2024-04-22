import Project, { ProjectModel } from "../models/Project.js";

export const getAllProjects = async () => {
  return new Promise(async (resolve) => {
    const results = await Project.find({});
    return resolve(results);
  });
};

export const getProjectById = async (id: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.findById(id);
    return resolve(doc);
  });
};

export const getProjectsByAccount = async (accountId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Project.find({ createdBy: accountId });
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
