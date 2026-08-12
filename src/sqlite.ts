import sqlite3 from './sqlite3-compat.js';
import { Database } from './sqlite3-compat.js';
import { SQLITE_PATH } from './config.js';
import sequelize from './sequelize.js';
import setupRelations from './relationships/relationships.js';
import Account from './models/Account.js';
import { hash } from '@node-rs/argon2';

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
                lastActive DATE,
                archived BOOLEAN
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
                sampleRate INTEGER,
                PRIMARY KEY (sessionId, deviceId),
                FOREIGN KEY (sessionId) REFERENCES Session(sessionId),
                FOREIGN KEY (deviceId) REFERENCES Device(deviceId)
            );
        `);

        // Device table
        db.run(`
            CREATE TABLE IF NOT EXISTS Device (
                deviceId TEXT NOT NULL,
                manufacturer TEXT,
                model TEXT,
                connectStatus TEXT,
                batteryLevel INTEGER,
                lastHeartbeat DATE,
                PRIMARY KEY (deviceId),
                FOREIGN KEY (manufacturer) REFERENCES Manufacturer(manufacturer)
                FOREIGN KEY (model) REFERENCES DeviceModel(model)
            );
        `);

        // DeviceSensorConfiguration table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceSensorConfiguration (
                sessionId INTEGER NOT NULL,
                deviceId INTEGER NOT NULL,
                sensorProperty TEXT NOT NULL,
                sensorType TEXT NOT NULL,
                active BOOLEAN NOT NULL,
                PRIMARY KEY (sessionId, deviceId, sensorProperty, sensorType),
                FOREIGN KEY (sessionId, deviceId) REFERENCES SessionDeviceMapping(sessionId, deviceId)
            );
        `);

        // DeviceModuleMapping
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceModuleMapping (
                deviceId INTEGER,
                moduleName TEXT,
                moduleManufacturer TEXT,
                sensorType TEXT,
                PRIMARY KEY (deviceId, moduleName, moduleManufacturer, sensorType),
                FOREIGN KEY (deviceId) REFERENCES Device(deviceId),
                FOREIGN KEY (moduleName, moduleManufacturer, sensorType) REFERENCES Module(name, manufacturer, sensorType)
            );
        `);

        // Sensor table
        db.run(`
            CREATE TABLE IF NOT EXISTS Sensor (
                type TEXT NOT NULL PRIMARY KEY
                );
        `);

        // SensorProperty table
        db.run(`
            CREATE TABLE IF NOT EXISTS Property (
                name TEXT NOT NULL,
                sensorType TEXT NOT NULL,
                moduleName TEXT NOT NULL,
                moduleManufacturer TEXT NOT NULL,
                unit TEXT,
                accuracy FLOAT,
                rangeMin FLOAT,
                rangeMax FLOAT,
                PRIMARY KEY (name, sensorType, moduleName, moduleManufacturer),
                FOREIGN KEY (sensorType) REFERENCES Sensor(type)
            );
        `);

        // Manufacturer table
        db.run(`
            CREATE TABLE IF NOT EXISTS Manufacturer (
                manufacturer TEXT PRIMARY KEY
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

        // DeviceModel table
        db.run(`
            CREATE TABLE IF NOT EXISTS DeviceModel (
                model TEXT PRIMARY KEY NOT NULL
            );
        `);

        // Module table
        db.run(`
            CREATE TABLE IF NOT EXISTS Module (
                name TEXT NOT NULL,
                manufacturer TEXT NOT NULL,
                sensorType TEXT NOT NULL,
                PRIMARY KEY (name, manufacturer, sensorType),
                FOREIGN KEY (manufacturer) REFERENCES Manufacturer(manufacturer),
                FOREIGN KEY (sensorType) REFERENCES Sensor(type)
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

const createDefaultUser = async () => {
  try {
    const userExists = await Account.findOne({ where: { email: 'admin@example.com' } });

    if (!userExists) {
      const hashedPassword = await hash('admin');
      await Account.create({
        name: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('Default user created with username: admin / password: admin');
    }
  } catch (err) {
    console.error('Error creating default user:', err);
  }
};

export { initDb, closeDb, startDb, createDefaultUser };





