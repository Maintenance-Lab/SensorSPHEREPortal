import Session from '../models/Session.js';

export const getSessionById = async (id: number): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    const doc = await Session.findByPk(id);
    if (!doc) return reject(new Error("Session not found"));
    const returnDoc = doc.toJSON();

    return resolve(returnDoc);
  });
};

export const getSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {project: projectId }});
    return resolve(doc);
  });
};

export const getActiveSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {project: projectId, archived: false }});
    return resolve(doc);
  });
};

export const getArchivedSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {project: projectId, archived: true }});
    return resolve(doc);
  });
};

export const createSession = async (item: Partial<Session>) => {
  return new Promise(async (resolve) => {
    const result = await Session.create(item);
    return resolve(result);
  });
};

export const updateSession = async (id: number, item: Partial<Session>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("Session ID not found"));

    const { sessionId, ...rest } = item;
    const newItem = { ...rest };
    const query = { SessionId: id };

    // const options = {
    //   // Return the document after updates are applied
    //   new: true,
    //   // Create a document if one isn't found.
    //   upsert: false,
    // };
    // const result = await Session.findOneAndUpdate(query, newItem, options);

    const result = await Session.findOne({ where: query });
    if (!result) return reject(new Error("Session not found"));
    result.update(newItem);

    return resolve(result);
  });
};

export const deleteSession = async (id: number) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("Session ID not found"));

    const query = { _id: id };
    const result = await Session.destroy({ where: { sessionId: id } });
    return resolve(result);
  });
};