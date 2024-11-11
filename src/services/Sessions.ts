import Session from '../models/Session.js';
import Project from '../models/Project.js';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping.js';

/* FUNCTIES DIE WERKEN - volgens mij (amber)

    getSessionsByProject
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
    return resolve(doc);
  });
};

export const getActiveSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {projectId: projectId}});
    return resolve(doc);
  });
};

export const getArchivedSessionsByProject = async (projectId: number) => {
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {projectId: projectId }});
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

// export const deleteSession = async (id: number) => {
//   return new Promise(async (resolve, reject) => {
//     if (!id) return reject(new Error("Session ID not found"));

//     const result = await Session.destroy({ where: { sessionId: id } });
//     return resolve(result);
//   });
// };

export const deleteSessions = async (ids: Array<number>) => {
  return new Promise(async (resolve) => {
    const results = [];
    console.log("in deleteSessions function", ids);
    for (const id of ids) {
      await SessionDeviceMapping.destroy({ where: { sessionId: id }});
      console.log("SessionDeviceMapping destroyed");
      const result = await Session.destroy({ where: { sessionId: id }});
      console.log("Session destroyed");

      results.push(result);
    }

    // TODO: DELETE DEVICES IF UNUSED

    return resolve(results);
  });
};

