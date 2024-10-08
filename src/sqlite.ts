import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { SQLITE_PATH } from './config.js';

// const sqlite3 = require('sqlite3').verbose();


// Initialize and configure the SQLite database
const initDb = () => {
    const db = new sqlite3.Database(SQLITE_PATH, (err) => {
        if (err) {
        console.error('Error connecting to SQLite database:', err.message);
        } else {
        console.log('Connected to SQLite database.');
        }
    });
    // Create tables
    db.serialize(() => {

        // Account table
        db.run(`
            CREATE TABLE IF NOT EXISTS Account (
                AccountId INTEGER PRIMARY KEY AUTOINCREMENT,
                Enabled INTEGER,
                Name TEXT NOT NULL,
                Password TEXT NOT NULL,
                Role TEXT NOT NULL,
                Email TEXT NOT NULL,
                Meta TEXT,
                CreatedAt DATE,
                HasChangedPassword INTEGER,
                HasAvatar INTEGER
            );
        `);

        // Project table
        db.run(`
            CREATE TABLE IF NOT EXISTS Project (
                ProjectID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Description TEXT,
                Meta TEXT,
                CreatedAt DATE,
                LastActive DATE,
                Archived INTEGER
            );
        `);

        // AccountProjectMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS AccountProjectMapping (
                AccountID INTEGER,
                ProjectID INTEGER,
                PRIMARY KEY (AccountID, ProjectID),
                FOREIGN KEY (AccountID) REFERENCES Account(AccountID),
                FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
            );
        `);
        

        // Session table
        db.run(`
            CREATE TABLE IF NOT EXISTS Session (
                SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
                Name TEXT NOT NULL,
                Status TEXT,
                ScheduledFrom DATE,
                ScheduledTo DATE,
                Meta TEXT,
                CreatedAt DATE,
                LastActive DATE,
                Archived INTEGER,
                PRIMARY KEY (SessionID)
            );
        `);

        // SessionDeviceMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS SessionDeviceMapping (
                SessionID INTEGER,
                DeviceID INTEGER,
                ConfiuredHz INTEGER,
                PRIMARY KEY (SessionID, DeviceID),
                FOREIGN KEY (SessionID) REFERENCES Session(SessionID),
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID)
            );
        `);

        // Device table
        db.run(`
            CREATE TABLE IF NOT EXISTS Device (
                DeviceID INTEGER NOT NULL,
                ConnectStatus BOOLEAN,
                MaxHz INTEGER,
                PRIMARY KEY (DeviceID),
                FOREIGN KEY (DeviceID) REFERENCES DeviceSensorMapping(DeviceID)
            );
        `);

        // DeviceSensorConfiguration table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (
                SessionID INTEGER NOT NULL,
                DeviceID INTEGER NOT NULL,
                PropertyName TEXT NOT NULL,
                Active BOOLEAN NOT NULL,
                PRIMARY KEY (SessionID, DeviceID, PropertyName),
                FOREIGN KEY (SessionID) REFERENCES Session(SessionID),
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID),
                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)
            );
        `);

        // DeviceSensorMapping
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorMapping (
                DeviceID INTEGER,
                SensorModel TEXT,
                ManufacturerName TEXT,
                Channel INTEGER,
                PRIMARY KEY (DeviceID, SensorModel, ManufacturerName, Channel),
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID),
                FOREIGN KEY (SensorModel) REFERENCES Sensor(Model),
                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName)
            );
        `);

        // Sensor table
        db.run(`
            CREATE TABLE IF NOT EXISTS Sensor (
                Model TEXT NOT NULL,
                ManufacturerName TEXT NOT NULL,
                CategoryName TEXT NOT NULL,
                PropertyName TEXT NOT NULL,
                PRIMARY KEY (Model, ManufacturerName),
                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName),
                FOREIGN KEY (CategoryName) REFERENCES SensorCategory(CategoryName),
                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)
                );
        `);

        // SensorCategory table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorCategory (
                CategoryName TEXT PRIMARY KEY
            );
        `);

        // SensorProperty table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorProperty (
                PropertyName TEXT PRIMARY KEY,
                Model TEXT,
                ManufacturerName TEXT,
                FOREIGN KEY (ManufacturerName) REFERENCES Manufacturer(ManufacturerName),
                FOREIGN KEY (Model) REFERENCES SensorCategory(Model)
            );
        `);

        // Manufacturer table
        db.run(`
            CREATE TABLE IF NOT EXISTS Manufacturer (
                ManufacturerName TEXT PRIMARY KEY
            );
        `);
        
    })
    return db;
};

const closeDb = (db: Database) => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database: ', err.message);
        } else {
            console.log('Closed the SQLite database connection.');
        }
    });
};

export { initDb, closeDb };
// const db = initDb();

// export default db;
