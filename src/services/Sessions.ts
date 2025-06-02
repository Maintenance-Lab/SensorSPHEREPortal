import Session from '../models/Session.js';
import Project from '../models/Project.js';
import Device from '../models/Device.js';
import SessionDeviceMapping from '../models/mappings/SessionDeviceMapping.js';
import { config } from 'dotenv-safe';
import DeviceSensorConfiguration from '../models/DeviceSensorConfiguration.js';

/* FUNCTIES DIE WERKEN - volgens mij (amber)
    getSessionById
    getSessionsByProject
    getActiveSessionsByProject
    getArchivedSessionsByProject
    createSession
    updateSession
    deleteSessions
*/

const updateProjectLastActive = async (projectId: number) => {
  const project = await Project.findByPk(projectId);
  if (!project) return null;
  project.lastActive = new Date();
  project.save();

  return project;
}


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
  return new Promise(async (resolve) => {
    const doc = await Session.findAll({ where: {projectId: projectId, archived: true}});
    if (!doc) return resolve([]);

    return resolve(doc);
  });
};

export const createSession = async (item: Partial<Session>) => {
  return new Promise(async (resolve) => {
    const result = await Session.create(item);
    if (!result) return resolve(null);

    // update the lastActive field of the project
    const project = await Project.findByPk(result.projectId);
    if (!project) return resolve(null);
    updateProjectLastActive(project.projectId);

    return resolve(result);
  });
};

export const addDevices = async (sessionId: number, deviceIds: Array<number>) => {
  const configuredHz = 1;
  return new Promise(async (resolve, reject) => {
    const results = [];
    for (const deviceId of deviceIds) {
      try {
        const mapping = await SessionDeviceMapping.findOne({ where: { sessionId: sessionId, deviceId: deviceId }});
        // if (mapping) return reject(new Error("Device already added to session"));
        if (!mapping) {
          const result = await SessionDeviceMapping.create({ sessionId: sessionId, deviceId: deviceId, configuredHz: configuredHz });
          if (!result) return reject(new Error("Failed to add device to session"));
          results.push(result);
        }
      }
      catch (error) {
        console.error("Error in addDevices:", error);
        return reject(error);
      }
      // const result = await SessionDeviceMapping.create({ sessionId: sessionId, deviceId: deviceId, configuredHz: configuredHz });
    }

    return resolve(results);
  });
}

export const updateSession = async (id: number, item: Partial<Session>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("Session ID not found"));

    const { sessionId, ...rest } = item;
    const newItem = { ...rest };
    newItem.lastActive = new Date();

    const result = await Session.findOne({ where: { SessionId: id }});
    if (!result) return reject(new Error("Session not found"));
    result.update(newItem);

    // update the lastActive field of the project too;
    const project = await Project.findByPk(result.projectId);
    if (!project) return reject(new Error("Project not found"));
    updateProjectLastActive(project.projectId);

    return resolve(result);
  });
};

export const deleteSessions = async (ids: Array<number>) => {
  return new Promise(async (resolve, reject) => {
    const results = [];
    for (const id of ids) {
      const session = await Session.findByPk(id);
      if (!session) return reject(new Error("Session not found"));

      const project = await Project.findByPk(session.projectId);
      if (!project) return reject(new Error("Project not found"));
      await updateProjectLastActive(project.projectId);


      await DeviceSensorConfiguration.destroy({ where: { sessionId: id }});
      await SessionDeviceMapping.destroy({ where: { sessionId: id }});
      const result = await Session.destroy({ where: { sessionId: id }});

      results.push(result);
    }

    return resolve(results);
  });
};

