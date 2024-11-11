import Session from '../models/Session.js';
import Project from '../models/Project.js';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping.js';

/* FUNCTIES DIE WERKEN - volgens mij (amber)
    getSessionById
    getSessionsByProject
    getActiveSessionsByProject
    getArchivedSessionsByProject
    createSession
    updateSession
    deleteSessions
*/


export const getSessionById = async (id: number): Promise<Session> => {
  console.log("in getSessionById", id);
  return new Promise(async (resolve, reject) => {
    const doc = await Session.findByPk(id);
    if (!doc) return reject(new Error("Session not found"));
    const returnDoc = doc.toJSON();

    return resolve(returnDoc);
  });
};

export const getSessionsByProject = async (projectId: number) => {
  console.log("in getSessionsByProject", projectId);
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: { projectId: projectId }});
    if (!doc) return resolve([]);

    return resolve(doc);
  });
};

export const getActiveSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({where: {projectId: projectId, archived: false}});
    // const projects = await Session.findAll({ where: {projectId: projectId, archived: false}});
    if (!doc) return resolve([]);
    return resolve(doc);
  });
};

// export const getActiveSessionsByProject = async (projectId: number) => {
//   console.log("in getActiveSessionsByProject", projectId);
//   try {
//     const doc = await Session.findAll({
//       where: { projectId: projectId, archived: false },
//     });
//     console.log("Resultaat:", doc);
//     return doc || [];
//   } catch (error) {
//     console.error("Error in getActiveSessionsByProject:", error);
//     throw error; // Hiermee kun je de fout doorgeven aan de caller
//   }
// };

export const getArchivedSessionsByProject = async (projectId: number) => {
  console.log("in getArchivedSessionsByProject", projectId);
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {projectId: projectId, archived: true}});
    if (!doc) return resolve([]);

    return resolve(doc);
  });
};

export const createSession = async (item: Partial<Session>) => {
  console.log("in createSession", item);
  return new Promise(async (resolve) => {
    const result = await Session.create(item);
    if (!result) return resolve(null);

    return resolve(result);
  });
};

export const updateSession = async (id: number, item: Partial<Session>) => {
  console.log("in updateSession", id, item);
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("Session ID not found"));

    const { sessionId, ...rest } = item;
    const newItem = { ...rest };

    const result = await Session.findOne({ where: { SessionId: id }});
    if (!result) return reject(new Error("Session not found"));
    result.update(newItem);

    return resolve(result);
  });
};

export const deleteSessions = async (ids: Array<number>) => {
  console.log("in deleteSessions function", ids);
  return new Promise(async (resolve) => {
    const results = [];
    for (const id of ids) {
      await SessionDeviceMapping.destroy({ where: { sessionId: id }});
      const result = await Session.destroy({ where: { sessionId: id }});
      results.push(result);
    }

    return resolve(results);
  });
};

