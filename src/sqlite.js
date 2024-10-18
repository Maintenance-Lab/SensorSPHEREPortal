"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startDb = exports.closeDb = exports.initDb = void 0;
var sqlite3_1 = require("sqlite3");
var config_js_1 = require("./config.js");
var sequelize_js_1 = require("./sequelize.js");
// const sqlite3 = require('sqlite3').verbose();
// Initialize and configure the SQLite database
var initDb = function () {
    var db = new sqlite3_1.default.Database(config_js_1.SQLITE_PATH, function (err) {
        if (err) {
            console.error('Error connecting to SQLite database:', err.message);
        }
        else {
            console.log('Connected to SQLite database.');
        }
    });
    // Create tables
    db.serialize(function () {
        // Account table
        db.run("\n            CREATE TABLE IF NOT EXISTS Account (\n                AccountId INTEGER PRIMARY KEY AUTOINCREMENT,\n                Enabled INTEGER,\n                Name TEXT NOT NULL,\n                Password TEXT NOT NULL,\n                Role TEXT NOT NULL,\n                Email TEXT NOT NULL,\n                Meta TEXT,\n                CreatedAt DATE,\n                HasChangedPassword INTEGER,\n                HasAvatar INTEGER\n            );\n        ");
        // Project table
        db.run("\n            CREATE TABLE IF NOT EXISTS Project (\n                ProjectId INTEGER PRIMARY KEY AUTOINCREMENT,\n                Name TEXT NOT NULL,\n                Description TEXT,\n                Meta TEXT,\n                CreatedAt DATE,\n                LastActive DATE,\n                Archived INTEGER\n            );\n        ");
        // AccountProjectMapping table
        db.run("\n            CREATE TABLE IF NOT EXISTS AccountProjectMapping (\n                AccountId INTEGER,\n                ProjectId INTEGER,\n                PRIMARY KEY (AccountId, ProjectId),\n                FOREIGN KEY (AccountId) REFERENCES Account(AccountId),\n                FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)\n            );\n        ");
        // Session table
        db.run("\n            CREATE TABLE IF NOT EXISTS Session (\n                SessionId INTEGER,\n                Name TEXT NOT NULL,\n                Status TEXT,\n                ScheduledFrom DATE,\n                ScheduledTo DATE,\n                Meta TEXT,\n                CreatedAt DATE,\n                LastActive DATE,\n                Archived INTEGER,\n                PRIMARY KEY (SessionId)\n            );\n        ");
        // SessionDeviceMapping table
        db.run("\n            CREATE TABLE IF NOT EXISTS SessionDeviceMapping (\n                SessionId INTEGER,\n                DeviceId INTEGER,\n                ConfiuredHz INTEGER,\n                PRIMARY KEY (SessionId, DeviceId),\n                FOREIGN KEY (SessionId) REFERENCES Session(SessionId),\n                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId)\n            );\n        ");
        // Device table
        db.run("\n            CREATE TABLE IF NOT EXISTS Device (\n                DeviceId INTEGER NOT NULL,\n                ConnectStatus BOOLEAN,\n                MaxHz INTEGER,\n                PRIMARY KEY (DeviceId),\n                FOREIGN KEY (DeviceId) REFERENCES DeviceSensorMapping(DeviceId)\n            );\n        ");
        // DeviceSensorConfiguration table
        db.run("\n            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (\n                SessionId INTEGER NOT NULL,\n                DeviceId INTEGER NOT NULL,\n                PropertyName TEXT NOT NULL,\n                Active BOOLEAN NOT NULL,\n                PRIMARY KEY (SessionId, DeviceId, PropertyName),\n                FOREIGN KEY (SessionId) REFERENCES Session(SessionId),\n                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId),\n                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)\n            );\n        ");
        // DeviceSensorMapping
        db.run("\n            CREATE TABLE IF NOT EXISTS DeviceSensorMapping (\n                DeviceId INTEGER,\n                SensorModel TEXT,\n                ManufacturerName TEXT,\n                Channel INTEGER,\n                PRIMARY KEY (DeviceId, SensorModel, ManufacturerName, Channel),\n                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId),\n                FOREIGN KEY (SensorModel) REFERENCES Sensor(Model),\n                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName)\n            );\n        ");
        // Sensor table
        db.run("\n            CREATE TABLE IF NOT EXISTS Sensor (\n                Model TEXT NOT NULL,\n                ManufacturerName TEXT NOT NULL,\n                CategoryName TEXT NOT NULL,\n                PropertyName TEXT NOT NULL,\n                PRIMARY KEY (Model, ManufacturerName),\n                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName),\n                FOREIGN KEY (CategoryName) REFERENCES SensorCategory(CategoryName),\n                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)\n                );\n        ");
        // SensorCategory table
        db.run("\n            CREATE TABLE IF NOT EXISTS SensorCategory (\n                CategoryName TEXT PRIMARY KEY\n            );\n        ");
        // SensorProperty table
        db.run("\n            CREATE TABLE IF NOT EXISTS SensorProperty (\n                PropertyName TEXT PRIMARY KEY,\n                Model TEXT,\n                ManufacturerName TEXT,\n                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName),\n                FOREIGN KEY (Model) REFERENCES SensorCategory(Model)\n            );\n        ");
        // Manufacturer table
        db.run("\n            CREATE TABLE IF NOT EXISTS Manufacturer (\n                ManufacturerName TEXT PRIMARY KEY\n            );\n        ");
        // LoginSession table
        db.run("\n            CREATE TABLE IF NOT EXISTS LoginSession (\n                LoginSessionId INTEGER PRIMARY KEY AUTOINCREMENT,\n                Account INTEGER,\n                LoginSessionDate DATE,\n                UserAgent TEXT,\n                Ip TEXT,\n                Token TEXT,\n                FOREIGN KEY (Account) REFERENCES Account(AccountId)\n            );\n        ");
    });
    return db;
};
exports.initDb = initDb;
var closeDb = function (db) {
    db.close(function (err) {
        if (err) {
            console.error('Error closing database: ', err.message);
        }
        else {
            console.log('Closed the SQLite database connection.');
        }
    });
};
exports.closeDb = closeDb;
// (async () => {
//     await sequelize.sync({force: true});
//     console.log('All models were synchronized successfully.');
// })();
var startDb = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Set up associations
                // TODO: Add associations
                console.log('In set up associations');
                // Sync models to the database
                // await sequelize.sync({alter: true});
                return [4 /*yield*/, sequelize_js_1.default.sync()];
            case 1:
                // Sync models to the database
                // await sequelize.sync({alter: true});
                _a.sent();
                console.log('All models were synchronized successfully.');
                return [2 /*return*/];
        }
    });
}); };
exports.startDb = startDb;
// export default db;
