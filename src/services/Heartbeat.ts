import { getAllOldDevices } from "./Device.js";
import Device from "../models/Device.js";

export const checkAlive = async () => {
    return new Promise(async () => {
        console.log("In check alive");
        try {
            const oldDevices:Device[] = await getAllOldDevices();
            for (const device of oldDevices) {
                console.log("Device: ", device);
                const doc = await Device.update({ connectStatus: "disconnected" }, { where: { deviceId: device.deviceId } });
                // if (!doc) return reject(new Error("Error updating device"));
            }
        } catch (error) {
            console.log("Error updating device: ", error);
        }

        // if (!lastHeartbeat) return reject(new Error("Device for hearbeat update not found"));
        // if (!oldDevices) return reject(new Error("Hearbeat update failed"));

    });}

export const backgroundHeartBeatStart = async() => {
    const checkAliveId = await setInterval(checkAlive, 60000);
    return checkAliveId;
}