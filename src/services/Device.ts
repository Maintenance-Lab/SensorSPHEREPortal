import Device from "../models/Device.js";
import Project from "../models/Project.js";

export const getAllDevices = async (): Promise<Device[]> => {
    return new Promise(async (resolve) => {
        console.log("in getAllDevices");
        const results = await Device.findAll();
        if (!results) return resolve([]);
        console.log("all devices", results);
        // return resolve(docs.map(doc => doc.toJSON()));
        return resolve(results);


        // return new Promise(async (resolve) => {
        //     const results = await Project.findAll();
        //     if (!results) return resolve([]);
        //     console.log("ALL PROJECTS: ", results.map((r) => r.projectId));
        //     return resolve(results);
    });
}

export const getDeviceById = async (id: number): Promise<Device> => {
    return new Promise(async (resolve, reject) => {
        console.log("in getDeviceById", id);
        const doc = await Device.findByPk(id);
        if (!doc) return reject(new Error("Device not found"));
        return resolve(doc.toJSON());
    });
}
