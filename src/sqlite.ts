import sqlite3 from 'sqlite3';
// import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { SQLITE_PATH } from './config.js';
import sequelize from './sequelize.js';
import setupRelations from './relationships/relationships.js';

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
                accountId INTEGER PRIMARY KEY AUTOINCREMENT,
                enabled INTEGER,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                email TEXT NOT NULL,
                meta TEXT,
                createdAt DATE,
                hasChangedPassword INTEGER,
                hasAvatar INTEGER
            );
        `);

        // Project table
        db.run(`
            CREATE TABLE IF NOT EXISTS Project (
                projectId INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                meta TEXT,
                createdAt DATE,
                lastActive DATE
            );
        `);

        // AccountProjectMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS AccountProjectMapping (
                accountId INTEGER,
                projectId INTEGER,
                status TEXT,
                PRIMARY KEY (accountId, projectId),
                FOREIGN KEY (accountId) REFERENCES Account(accountId),
                FOREIGN KEY (projectId) REFERENCES Project(projectId)
            );
        `);


        // Session table
        db.run(`
            CREATE TABLE IF NOT EXISTS Session (
                sessionId INTEGER,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT,
                scheduledFrom DATE,
                scheduledTo DATE,
                projectId INTEGER,
                meta TEXT,
                createdAt DATE,
                lastActive DATE,
                archived INTEGER,
                PRIMARY KEY (sessionId)
            );
        `);

        // SessionDeviceMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS SessionDeviceMapping (
                sessionId INTEGER,
                deviceId INTEGER,
                configuredHz INTEGER,
                PRIMARY KEY (sessionId, deviceId),
                FOREIGN KEY (sessionId) REFERENCES Session(sessionId),
                FOREIGN KEY (deviceId) REFERENCES Device(deviceId)
            );
        `);

        // Device table
        db.run(`
            CREATE TABLE IF NOT EXISTS Device (
                deviceId TEXT NOT NULL,
                manufacturerName TEXT NOT NULL,
                connectStatus TEXT,
                batteryLevel INTEGER,
                maxHz INTEGER,
                lastHeartbeat DATE,
                PRIMARY KEY (deviceId),
                FOREIGN KEY (manufacturerName) REFERENCES Manufacturer(manufacturerName)
            );
        `);

        // DeviceSensorConfiguration table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (
                sessionId INTEGER NOT NULL,
                deviceId INTEGER NOT NULL,
                propertyName TEXT NOT NULL,
                model TEXT NOT NULL,
                manufacturerName TEXT NOT NULL,
                active BOOLEAN NOT NULL,
                PRIMARY KEY (sessionId, deviceId, propertyName, model, manufacturerName),
                FOREIGN KEY (sessionId, deviceId) REFERENCES SessionDeviceMapping(sessionId, deviceId),
                FOREIGN KEY (propertyName, model, manufacturerName) REFERENCES SensorProperty(propertyName, model, manufacturerName)
            );
        `);

        // DeviceSensorMapping
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorMapping (
                deviceId INTEGER,
                model TEXT,
                manufacturerName TEXT,
                channel INTEGER,
                PRIMARY KEY (deviceId, model, manufacturerName, channel),
                FOREIGN KEY (deviceId) REFERENCES Device(deviceId),
                FOREIGN KEY (model, manufacturerName) REFERENCES Sensor(model, manufacturerName)
            );
        `);

        // Sensor table
        db.run(`
            CREATE TABLE IF NOT EXISTS Sensor (
                model TEXT NOT NULL,
                manufacturerName TEXT NOT NULL,
                categoryName TEXT NOT NULL,
                PRIMARY KEY (model, manufacturerName),
                FOREIGN KEY (manufacturerName) REFERENCES Manufacturer(manufacturerName),
                FOREIGN KEY (categoryName) REFERENCES SensorCategory(categoryName)
                );
        `);

        // SensorCategory table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorCategory (
                categoryName TEXT PRIMARY KEY
            );
        `);

        // SensorProperty table
        db.run(`
            CREATE TABLE IF NOT EXISTS SensorProperty (
                propertyName TEXT,
                model TEXT,
                manufacturerName TEXT,
                PRIMARY KEY (propertyName, model, manufacturerName),
                FOREIGN KEY (manufacturerName, model) REFERENCES Sensor(manufacturerName, model)
            );
        `);

        // Manufacturer table
        db.run(`
            CREATE TABLE IF NOT EXISTS Manufacturer (
                manufacturerName TEXT PRIMARY KEY
            );
        `);

        // LoginSession table
        db.run(`
            CREATE TABLE IF NOT EXISTS LoginSession (
                loginSessionId INTEGER PRIMARY KEY AUTOINCREMENT,
                account INTEGER,
                loginSessionDate DATE,
                userAgent TEXT,
                ip TEXT,
                token TEXT,
                FOREIGN KEY (Account) REFERENCES Account(accountId)
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

const startDb = async () => {
    // Set up associations
    setupRelations();

    // Sync models to the database
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
}

// initDb();
// startDb();

export { initDb, closeDb, startDb };
// export default db;




