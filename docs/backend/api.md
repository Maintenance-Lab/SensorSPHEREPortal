# SensorSPHERE Portal API

All API routes for the SensorSPHERE Portal are defined in [the routes folder](../../src/routes/api/).
Most files get a folder following their path, to split files up.

## User authentication

Routes that should be secured use the [getSession()](../../src/utils.ts) function to get all information about a session.
[getSession()](../../src/utils.ts) returns `null` and handles the request if no session has been found in the request. An appropriate `401` response is returned.
If a session is found, the function responds with the active sessions for that user and the user information stored in the cookies.
This includes accountId, name, role, hasAvatar, email and hasChangedPassword, but more information can be added in [the login API call](../../src/routes/api/login.ts) where the cookie is created.

## Admin authentication

To make sure that a user is an administrator, the [isAdmin()](../../src/utils.ts) function can be used. It works identically to [getSession()](../../src/utils.ts), but only returns a user if the user has the `admin` role.

## Route overview

All routes are mounted under `/api` in [src/index.ts](../../src/index.ts).

| Group | Path prefix | Description |
| ----- | ----------- | ----------- |
| Login | `/login` | Authenticate with username/email + password, returns a JWT in a cookie |
| Account | `/account` | Current account info and login sessions |
| Admin | `/admin/accounts` | Account management for administrators |
| Devices | `/devices` | Device listing, configuration and batch control |
| Projects | `/projects` | Project CRUD and collaboration |
| Sessions | `/sessions` | Session CRUD, device assignment and status |
| Status | `/status` | Backend, MQTT, WebSocket and MongoDB reachability report |
| Test | `/test` | Development/diagnostic endpoint |

### Login (`/login`)

- `POST /` — verifies username/email and password (Argon2), creates a `LoginSession`, sets the JWT cookie and redirects the client to `/home`.

### Account (`/account`)

- `GET /` (index) — the currently logged-in account and its active login sessions.
- `GET /session` — the active login sessions for the logged-in account.

### Admin (`/admin/accounts`)

- Account management endpoints for users with the `admin` role.

### Devices (`/devices`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/all` | All devices |
| GET | `/all/:session` | Devices mapped to a session |
| GET | `/id/:id` | A single device by ID (MAC address) |
| GET | `/available/:session` | Devices not yet assigned to the session |
| POST | `/addToSession` | Add devices to a session; also creates the matching `DeviceSensorConfiguration` rows |
| GET | `/properties/:deviceId` | Sensor properties the device supports |
| GET | `/selectedProperties/:sessionId/:deviceId` | Sensor properties selected for the device in a session |
| PUT | `/updateSelectedProperties` | Update the selected sensor properties |
| GET | `/getSampleRate/:sessionId/:deviceId` | The device's sample rate in a session |
| PUT | `/saveSampleRate` | Save the sample rate for a device in a session |
| PUT | `/sendConfiguration` | Publish the device configuration to the gateway (`interface/validateConfiguration`) |
| GET | `/units` | List units known to the gateway (`interface/listUnits`) |
| PUT | `/startBatch` | Start measurement batches for a session (`interface/startBatch`) |
| PUT | `/stopBatch` | Stop measurement batches for a session (`interface/stopBatch`) |
| GET | `/checkOccupied/:deviceId/:sessionId` | Whether a device is already measuring in another active session |

### Projects (`/projects` and `/project`)

- `GET /active`, `GET /archived`, `GET /all`, `GET /latest`, `GET /id/:projectId` — list/get projects for the logged-in account.
- `POST /accept` — accept a pending project invitation (`AccountProjectMapping` status `pending` -> `active`).
- `POST /create` — create a project.
- `PUT /update/:id`, `PUT /update-many` — update one or more projects.
- `POST /delete` — delete one or more projects.
- `POST /collaborator/*` (`/project/collaborator`) — manage project collaborators.

### Sessions (`/sessions`)

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/id/:id` | A session by ID |
| GET | `/project/:projectId` | All sessions of a project |
| GET | `/project/active/:projectId` | Active sessions of a project |
| GET | `/project/archived/:projectId` | Archived sessions of a project |
| GET | `/getStatus/:sessionId` | The session status string |
| POST | `/create` | Create a session |
| POST | `/addDevices` | Add devices to a session |
| POST | `/delete` | Delete one or more sessions |
| PUT | `/update/:id` | Update a session |
| PUT | `/update-many` | Update multiple sessions |
| PUT | `/updateStatus` | Update the session status (`Idle` / `Measuring`) |
| DELETE | `/removeFromSession` | Remove devices from a session (and their sensor configuration) |

### Status (`/status`)

- `GET /` — JSON report of the backend (location, MQTT URI, port, uptime, memory), the gateway connectivity (Mosquitto MQTT connection, WebSocket connection, MongoDB reachability) and the gateway WebSocket state.

### Test (`/test`)

- `GET /testing` — diagnostic endpoint returning a static JSON response.