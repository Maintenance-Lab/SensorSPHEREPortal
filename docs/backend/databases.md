# SensorSPHERE Portal Backend Database

The portal uses **SQLite** as its database, accessed through the **Sequelize** ORM.
The database file is stored at `database/db.sqlite3` by default (see [configuration.md](./configuration.md)).
The table creation and synchronization logic lives in [src/sqlite.ts](../../src/sqlite.ts), while all model definitions live in the [Models folder](../../src/models/).

All models have a matching file in the [Services folder](../../src/services/) where all business logic is handled. Functions to add, remove and edit data should be defined there.

## Tables

### Account

User account used to log in to the portal.

| Column | Type | Notes |
| ------ | ---- | ----- |
| accountId | INTEGER | Primary key, auto-increment |
| enabled | BOOLEAN | Default `true`; disabled accounts cannot log in |
| name | STRING(100) | Not null, unique |
| email | STRING(50) | Not null, unique |
| password | STRING | Argon2 hash of the password |
| role | STRING | `admin`, `student`, `teacher` or `staff` (default `student`) |
| meta | JSON | Extra info if needed |
| createdAt | DATE | Default now |
| hasChangedPassword | BOOLEAN | Default `false` |
| hasAvatar | BOOLEAN | Default `false` |

### LoginSession

Records each successful login (token, user agent and IP) to support session validation.

| Column | Type | Notes |
| ------ | ---- | ---- |
| loginSessionId | INTEGER | Primary key, auto-increment |
| account | INTEGER | Foreign key -> Account.accountId |
| loginSessionDate | DATE | Default now |
| userAgent | STRING | Not null |
| ip | STRING | Not null |
| token | STRING | Not null |

### Project

A container for one or more data collection sessions.

| Column | Type | Notes |
| ------ | ---- | ---- |
| projectId | INTEGER | Primary key, auto-increment |
| name | STRING(100) | Not null |
| description | STRING(1000) | |
| meta | JSON | Default `{}` |
| createdAt | DATE | Default now |
| lastActive | DATE | Default now |
| archived | BOOLEAN | Default `false` |

### Session

A data collection run inside a project, linked to one or more devices.

| Column | Type | Notes |
| ------ | ---- | ---- |
| sessionId | INTEGER | Primary key, auto-increment |
| name | STRING | Not null |
| description | STRING | |
| status | STRING | `Idle` or `Measuring` (default `Idle`) |
| scheduledFrom | DATE | |
| scheduledTo | DATE | |
| projectId | INTEGER | Foreign key -> Project.projectId, not null |
| meta | JSON | |
| createdAt | DATE | Default now |
| lastActive | DATE | Default now |
| archived | BOOLEAN | Default `false` |

### Device

A physical SensorSPHERE Unit, identified by its MAC address.

| Column | Type | Notes |
| ------ | ---- | ---- |
| deviceId | STRING | Primary key; MAC address `XX:XX:XX:XX:XX:XX` |
| manufacturer | STRING | Foreign key -> Manufacturer.manufacturer |
| model | STRING | Foreign key -> DeviceModel.model |
| connectStatus | STRING | `connected` or `disconnected` (default `connected`) |
| batteryLevel | INTEGER | Default `0` |
| lastHeartbeat | DATE | Default now |

### Reference tables

Small lookup tables used to normalize device/sensor metadata.

| Table | Column(s) |
| ----- | --------- |
| Manufacturer | `manufacturer` (PK) |
| DeviceModel | `model` (PK) |
| Sensor | `type` (PK), e.g. `main` |
| Module | composite PK `(name, manufacturer, sensorType)`; FK to Manufacturer and Sensor |
| Property | composite PK `(name, sensorType, moduleName, moduleManufacturer)`; `unit`, `accuracy`, `rangeMin`, `rangeMax`; FK to Sensor |

### Mapping tables

Join tables that connect accounts, projects, sessions and devices.

| Table | Primary key | Notes |
| ----- | ----------- | ----- |
| AccountProjectMapping | `(accountId, projectId)` | FK to Account and Project; `status` is `active`, `archived` or `pending` |
| SessionDeviceMapping | `(sessionId, deviceId)` | FK to Session and Device; `sampleRate` (INTEGER, may be null) |
| DeviceModuleMapping | `(deviceId, moduleName, moduleManufacturer, sensorType)` | FK to Device and Module |
| DeviceSensorConfiguration | `(sessionId, deviceId, sensorProperty, sensorType)` | FK to SessionDeviceMapping; `active` (BOOLEAN, default `true`) — which sensor properties a device records during a session |

## Relationships

The model associations are defined in [src/relationships/](../../src/relationships/). An ER diagram is available in the repository root (`ERD.png`).

## Default data

On first start, [src/sqlite.ts](../../src/sqlite.ts) synchronizes all tables and, if no account exists with email `admin@example.com`, creates a default administrator:

- Username: `admin`
- Password: `admin`
- Email: `admin@example.com`