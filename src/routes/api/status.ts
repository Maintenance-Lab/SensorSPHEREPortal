import { Router } from 'express';
import net from 'net';
import os from 'os';
import mqtt from '../../index.js';
import { gatewaySocket } from '../../services/device.js';
import { MQTT_URI, MONGODB_URI, BACKEND_LOCATION, PORT } from '../../config.js';

const router = Router();

const getHostPort = (uri: string): { host: string; port: number } | null => {
  if (!uri) return null;
  try {
    const u = new URL(uri);
    return {
      host: u.hostname,
      port: Number(u.port || 0),
    };
  } catch {
    return null;
  }
};

const isReachable = (host: string, port: number, timeout = 2000): Promise<boolean> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const finish = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeout);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
    socket.connect(port, host);
  });
};

router.get("/", async (_, res) => {
  const mongodbTarget = getHostPort(MONGODB_URI);

  const mongodb = mongodbTarget
    ? await isReachable(mongodbTarget.host, mongodbTarget.port)
    : false;

  const memory = process.memoryUsage();

  return res.json({
    backend: {
      location: BACKEND_LOCATION,
      mqttUri: MQTT_URI,
      hostname: os.hostname(),
      port: PORT,
      nodeEnv: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      serverTime: new Date().toISOString(),
      memoryMb: {
        rss: Math.round(memory.rss / 1024 / 1024),
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      },
    },
    gateway: {
      mosquitto: { connected: mqtt.connected === true },
      websocket: { connected: gatewaySocket.readyState === 1 },
      mongodb: { connected: mongodb, configured: Boolean(mongodbTarget) },
    },
  });
});

export default router;