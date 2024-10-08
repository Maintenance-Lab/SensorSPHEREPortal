import sqlite3 from 'sqlite3';
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
        // User table
        db.run(`
            CREATE TABLE IF NOT EXISTS User (
                UserID INTEGER PRIMARY KEY AUTOINCREMENT,
                ProjectID INTEGER,
                Name TEXT NOT NULL,
                Password TEXT NOT NULL,
                Role TEXT NOT NULL,
                Email TEXT NOT NULL,
                FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
            );
        `);

        // Project table
        db.run(`
            CREATE TABLE IF NOT EXISTS Project (
                ProjectID INTEGER PRIMARY KEY AUTOINCREMENT,
                UserID INTEGER,
                SessionID INTEGER,
                Description TEXT,
                FOREIGN KEY (UserID) REFERENCES User(UserID),
                FOREIGN KEY (SessionID) REFERENCES Session(SessionID)
            );
        `);

        // UserProjectMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS UserProjectMapping (
                UserID INTEGER,
                ProjectID INTEGER,
                PRIMARY KEY (UserID, ProjectID),
                FOREIGN KEY (UserID) REFERENCES User(UserID),
                FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
            );
        `);

        // Session table
        db.run(`
            CREATE TABLE IF NOT EXISTS Session (
                SessionID INTEGER PRIMARY KEY AUTOINCREMENT,
                DeviceID INTEGER,
                ScheduledFrom DATE,
                ScheduledTo DATE,
                Status TEXT,
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID)
            );
        `);

        // SessionDeviceMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS SessionDeviceMapping (
                SessionID INTEGER,
                DeviceID INTEGER,
                ConfiguredHz INTEGER,
                PRIMARY KEY (SessionID, DeviceID),
                FOREIGN KEY (SessionID) REFERENCES Session(SessionID),
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID)
            );
        `);

        // Device table
        db.run(`
            CREATE TABLE IF NOT EXISTS Device (
                DeviceID INTEGER PRIMARY KEY AUTOINCREMENT,
                mac_address TEXT NOT NULL,
                ManufacturerName TEXT,
                Model TEXT,
                ConnectStatus TEXT,
                MaxHz INTEGER,
                FOREIGN KEY (ManufacturerName) REFERENCES SensorManufacturer(ManufacturerName)
            );
        `);

        // DeviceSensorConfiguration table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (
                SessionID INTEGER,
                DeviceID INTEGER,
                PropertyName TEXT,
                Active INTEGER,
                PRIMARY KEY (SessionID, DeviceID, PropertyName),
                FOREIGN KEY (SessionID) REFERENCES Session(SessionID),
                FOREIGN KEY (DeviceID) REFERENCES Device(DeviceID),
                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)
            );
        `);

        // Sensor table
        db.run(`
            CREATE TABLE IF NOT EXISTS Sensor (
                Model TEXT,
                ManufacturerName TEXT,
                CategoryName TEXT,
                PropertyName TEXT,
                PRIMARY KEY (Model),
                FOREIGN KEY (ManufacturerName) REFERENCES SensorManufacturer(ManufacturerName),
                FOREIGN KEY (CategoryName) REFERENCES SensorCategory(CategoryName),
                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)
            );
        `);

        // SensorProperty table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorProperty (
                PropertyName TEXT PRIMARY KEY,
                Model TEXT,
                ManufacturerName TEXT,
                FOREIGN KEY (Model) REFERENCES Sensor(Model),
                FOREIGN KEY (ManufacturerName) REFERENCES SensorManufacturer(ManufacturerName)
            );
        `);

        // SensorManufacturer table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorManufacturer (
                ManufacturerName TEXT PRIMARY KEY
            );
        `);

        // SensorCategory table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorCategory (
                CategoryName TEXT PRIMARY KEY
            );
        `);
    });

    return db;
};

// Close database connection
const closeDb = (db) => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database: ', err.message);
        } else {
            console.log('Closed the SQLite database connection.');
        }
    });
};

module.exports = { initDb, closeDb };



export default db;


