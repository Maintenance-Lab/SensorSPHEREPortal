# SensorSPHERE Portal technical documentation

The SensorSPHERE Portal is a web-based management interface for the SensorSPHERE sensor network. It lets users create projects and sessions, configure sensor units and start/stop data collection remotely.
The project consists of two code projects: an Express.js + TypeScript backend (`/src/`) and a React frontend (`/client/`).

## Features

- **Account management** — login with JWT cookies, per-account roles (`admin`, `student`, `teacher`, `staff`) and login session tracking.
- **Projects & sessions** — hierarchical containers for data collection runs, with archiving, scheduling and collaboration between accounts.
- **Device management** — devices (SensorSPHERE Units) register with the portal; per session you can assign devices, pick which sensor properties to record and set the sample rate.
- **Remote control over MQTT** — the backend connects to the gateway's MQTT broker to list units, validate/send configurations and start/stop measurement batches.
- **Live status via WebSocket** — a WebSocket server (port 8080) broadcasts unit lists and sample-rate events to connected clients so the UI updates in real time.
- **Status endpoint** — reports backend health, MQTT connection state, gateway WebSocket state and MongoDB reachability.

## Architecture

```
React frontend (/client)
   |  HTTP (REST)   -> Express backend (/src)  -> SQLite database (Sequelize)
   |  WebSocket     -> WebSocket server (port 8080)
   |                    |  MQTT (interface/*)
   v                    v
   Mosquitto broker  <-> SensorSPHERE Gateway  <-> SensorSPHERE Units
```

The backend stores its data in SQLite (see [Database structure](./backend/databases.md)) and communicates with the rest of the SensorSPHERE ecosystem over MQTT (topics under `interface/*`).

## Frontend

The frontend can be found in the `/client/` folder.

- [Routing](./frontend/routing.md)
- [Session information](./frontend/sessions.md)

## Backend

The backend can be found in `/src/`.

- [Database structure](./backend/databases.md)
- [Configuration file](./backend/configuration.md)
- [API structure](./backend/api.md)

## MQTT

For MQTT documentation, check the [SensorSPHERE Gateway documents](https://github.com/Maintenance-Lab/SensorSPHEREGateway/blob/development/docs/mqtt.md) and the [centralized SensorSPHERE documentation](https://github.com/Maintenance-Lab/SensorSPHEREDocs).