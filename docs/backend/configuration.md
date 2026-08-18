# SensorSPHERE Portal configuration

Configuration for the SensorSPHERE Portal is done in the `.env` file and the [config file](../../src/config.ts).
The config file parses all environment variables and exports them to the rest of the project.

## Environment variables

An example `.env` file (also available as `.env.example`):

```env
ENV=production
PORT=9050
JWT_ACCESS_SECRET=
JWT_EXPIRESIN=
SQLITE_PATH=
MQTT_URI=
```

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `ENV` | `development` | `development` or `production`. When `production`, the login cookie is only sent over HTTPS. |
| `PORT` | `7080` | Port the Express backend listens on. The React dev server (in `client/`) proxies API calls to `http://localhost:9051` (see `client/package.json`). |
| `JWT_ACCESS_SECRET` | `""` | Secret used to sign JWT access tokens. Must be set. |
| `JWT_EXPIRESIN` | `7200` | JWT token lifetime in seconds. |
| `SQLITE_PATH` | `database/db.sqlite3` | Location of the SQLite database file. |
| `MQTT_URI` | `""` | MQTT broker URI the backend connects to (e.g. `mqtt://10.42.0.1:1883`). Used to talk to the SensorSPHERE Gateway. |
| `MONGODB_URI` | `""` | Legacy MongoDB connection string, no longer used for storage. Only read by the status endpoint to report broker reachability. |
| `BACKEND_LOCATION` | `"cloud"` in production, else `"local"` | Label reported by the status endpoint. |
| `FIRMWARE` | `""` | Expected firmware version, used by the UI to inform users about outdated units. |

A `.env` file for local development might look like:

```env
ENV=development
PORT=9051
JWT_ACCESS_SECRET=testing
JWT_EXPIRESIN=21600
MQTT_URI='mqtt://10.42.0.1:1883'
SQLITE_PATH='./database/db.sqlite3'
DANGEROUSLY_DISABLE_HOST_CHECK=true
FIRMWARE='1.2.2'
```

`DANGEROUSLY_DISABLE_HOST_CHECK` is used by the React dev server (Create React App) and belongs in `client/.env`, not the backend `.env`.