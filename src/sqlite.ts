import sqlite3 from 'sqlite3';
// import * as sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import { SQLITE_PATH } from './config.js';
import sequelize from './sequelize.js';

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
                ProjectId INTEGER PRIMARY KEY AUTOINCREMENT,
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
                AccountId INTEGER,
                ProjectId INTEGER,
                PRIMARY KEY (AccountId, ProjectId),
                FOREIGN KEY (AccountId) REFERENCES Account(AccountId),
                FOREIGN KEY (ProjectId) REFERENCES Project(ProjectId)
            );
        `);


        // Session table
        db.run(`
            CREATE TABLE IF NOT EXISTS Session (
                SessionId INTEGER,
                Name TEXT NOT NULL,
                Status TEXT,
                ScheduledFrom DATE,
                ScheduledTo DATE,
                Meta TEXT,
                CreatedAt DATE,
                LastActive DATE,
                Archived INTEGER,
                PRIMARY KEY (SessionId)
            );
        `);

        // SessionDeviceMapping table
        db.run(`
            CREATE TABLE IF NOT EXISTS SessionDeviceMapping (
                SessionId INTEGER,
                DeviceId INTEGER,
                ConfiuredHz INTEGER,
                PRIMARY KEY (SessionId, DeviceId),
                FOREIGN KEY (SessionId) REFERENCES Session(SessionId),
                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId)
            );
        `);

        // Device table
        db.run(`
            CREATE TABLE IF NOT EXISTS Device (
                DeviceId INTEGER NOT NULL,
                ConnectStatus BOOLEAN,
                MaxHz INTEGER,
                PRIMARY KEY (DeviceId),
                FOREIGN KEY (DeviceId) REFERENCES DeviceSensorMapping(DeviceId)
            );
        `);

        // DeviceSensorConfiguration table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (
                SessionId INTEGER NOT NULL,
                DeviceId INTEGER NOT NULL,
                PropertyName TEXT NOT NULL,
                Active BOOLEAN NOT NULL,
                PRIMARY KEY (SessionId, DeviceId, PropertyName),
                FOREIGN KEY (SessionId) REFERENCES Session(SessionId),
                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId),
                FOREIGN KEY (PropertyName) REFERENCES SensorProperty(PropertyName)
            );
        `);

        // DeviceSensorMapping
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorMapping (
                DeviceId INTEGER,
                SensorModel TEXT,
                ManufacturerName TEXT,
                Channel INTEGER,
                PRIMARY KEY (DeviceId, SensorModel, ManufacturerName, Channel),
                FOREIGN KEY (DeviceId) REFERENCES Device(DeviceId),
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

        // LoginSession table
        db.run(`
            CREATE TABLE IF NOT EXISTS LoginSession (
                LoginSessionId INTEGER PRIMARY KEY AUTOINCREMENT,
                Account INTEGER,
                LoginSessionDate DATE,
                UserAgent TEXT,
                Ip TEXT,
                Token TEXT,
                FOREIGN KEY (Account) REFERENCES Account(AccountId)
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


// (async () => {
//     await sequelize.sync({force: true});
//     console.log('All models were synchronized successfully.');
// })();

const startDb = async () => {
    // Set up associations
    // TODO: Add associations
    // console.log('In set up associations');

    // Sync models to the database
    // await sequelize.sync({alter: true});
    await sequelize.sync();
    console.log('All models were synchronized successfully.');
}

// initDb();
// startDb();

export { initDb, closeDb, startDb };
// export default db;




