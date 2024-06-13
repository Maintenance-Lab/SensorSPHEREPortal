import Session, { SessionModel } from "../models/Session.js";

export const getSessionById = async (id: string): Promise<SessionModel> => {
  return new Promise(async (resolve, reject) => {
    const doc = await Session.findById(id);
    if (!doc) return reject(new Error("Session not found"));
    const returnDoc = doc.toObject();

    return resolve(returnDoc);
  });
};

export const getSessionsByProject = async (projectId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Session.find({ project: projectId });
    return resolve(doc);
  });
};

export const getActiveSessionsByProject = async (projectId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Session.find({ project: projectId, archived: false });
    return resolve(doc);
  });
};

export const getArchivedSessionsByProject = async (projectId: string) => {
  return new Promise(async (resolve) => {
    const doc = await Session.find({ project: projectId, archived: true });
    return resolve(doc);
  });
};

export const createSession = async (item: Partial<SessionModel>) => {
  return new Promise(async (resolve) => {
    const result = await Session.create(item);
    return resolve(result);
  });
};

export const updateSession = async (id: string, item: Partial<SessionModel>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("Session ID not found"));

    const { _id, ...rest } = item;
    const newItem = { ...rest };
    const query = { _id: id };
    const options = {
      // Return the document after updates are applied
      new: true,
      // Create a document if one isn't found.
      upsert: false,
    };
    const result = await Session.findOneAndUpdate(query, newItem, options);
    return resolve(result);
  });
};