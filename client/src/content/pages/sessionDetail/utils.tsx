import { calculateLastSeen, formatLastSeenDevice } from "./startSessionHelpers";


export const formatDeviceRow = (device, sampleRate) => {
  const lastSeenRaw = calculateLastSeen(device);
  const lastSeen = formatLastSeenDevice(device);

  return {
    name: device.manufacturer,
    id: device.deviceId,
    manufacturer: device.manufacturer,
    model: device.model,
    connected: device.connectStatus,
    battery: device.batteryLevel,
    sampleRate: sampleRate ? sampleRate + " Hz" : "-",
    configured: sampleRate != null,
    lastSeen,
    lastSeenRaw,
    lastHeartbeat: device.lastHeartbeat,
  };
};

export const fetchDevicesWithSampleRates = async (api, sessionId) => {
  const devices = await api.fetchDevices(sessionId);
  const sampleRates = await Promise.all(
    devices.map(async (device) => {
      const sampleRate = await api.getSampleRate(sessionId, device.deviceId);
      return { deviceId: device.deviceId, sampleRate };
    })
  );
  return sampleRates;
};


