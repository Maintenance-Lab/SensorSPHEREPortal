// Helpers to apply realtime "list_units" WebSocket events to device data.
// Unit payload from the gateway (see src/services/mqtt.ts updateDeviceStatus):
//   { mac, batteryLevel, lastSeen, ... }
// Device DB fields: deviceId, connectStatus, batteryLevel, lastHeartbeat.

export const getUnitById = (units: any[], deviceId: string): any | undefined =>
  units.find((unit) => unit.mac === deviceId);

export const unitsToDevicePatch = (unit: any) => ({
  connectStatus: "connected",
  batteryLevel: unit.batteryLevel ?? null,
  lastHeartbeat: unit.lastSeen ?? null,
});

// Returns a new device array with realtime fields patched in for any device
// that appears in the units payload. Devices not present in the units payload
// are marked disconnected (matching the backend's updateDeviceStatus behavior).
// If no device actually changed, the original array reference is returned so
// callers can skip unnecessary re-renders.
export const patchDevicesFromUnits = (devices: any[], units: any[]): any[] => {
  if (!Array.isArray(units)) return devices;
  const unitByMac = new Map(units.map((unit) => [unit.mac, unit]));

  let changed = false;
  const patched = devices.map((device) => {
    const unit = unitByMac.get(device.deviceId);
    if (!unit) {
      if (device.connectStatus === 'disconnected') return device;
      changed = true;
      return { ...device, connectStatus: 'disconnected' };
    }
    const update = unitsToDevicePatch(unit);
    if (
      device.connectStatus === update.connectStatus &&
      device.batteryLevel === update.batteryLevel &&
      device.lastHeartbeat === update.lastHeartbeat
    ) {
      return device;
    }
    changed = true;
    return { ...device, ...update };
  });

  return changed ? patched : devices;
};
