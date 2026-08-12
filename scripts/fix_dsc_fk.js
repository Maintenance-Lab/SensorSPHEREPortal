// One-time fix: remove the stale FOREIGN KEY from DeviceSensorConfiguration.
//
// Before the Property table was scoped to modules, DeviceSensorConfiguration had
//   FOREIGN KEY (sensorProperty, sensorType) REFERENCES Property(name, sensorType)
// Since Property's primary key is now (name, sensorType, moduleName,
// moduleManufacturer), that reference is invalid and SQLite raises
// "foreign key mismatch" on any DML against DeviceSensorConfiguration when
// foreign keys are enabled (as Sequelize does).
//
// This rebuilds the table with only the valid FK to SessionDeviceMapping.
// Run with: node scripts/fix_dsc_fk.js
import { DatabaseSync } from 'node:sqlite';
import { copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'database', 'db.sqlite3');

const db = new DatabaseSync(DB_PATH, { enableForeignKeyConstraints: false });

const ddl = db
  .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='DeviceSensorConfiguration'")
  .get()?.sql;

if (!ddl) {
  console.error('DeviceSensorConfiguration table not found.');
  process.exit(1);
}

if (!ddl.includes('REFERENCES Property')) {
  console.log('DeviceSensorConfiguration no longer references Property; nothing to do.');
  db.close();
  process.exit(0);
}

const backupPath = `${DB_PATH}.bak-fkfix-${new Date().toISOString().replace(/[:.]/g, '-')}`;
copyFileSync(DB_PATH, backupPath);
console.log('Backup created at', backupPath);

const count = db.prepare('SELECT COUNT(*) c FROM DeviceSensorConfiguration').get().c;

db.exec(`
  CREATE TABLE DeviceSensorConfiguration_new (
    sessionId INTEGER NOT NULL,
    deviceId INTEGER NOT NULL,
    sensorProperty TEXT NOT NULL,
    sensorType TEXT NOT NULL,
    active BOOLEAN NOT NULL,
    PRIMARY KEY (sessionId, deviceId, sensorProperty, sensorType),
    FOREIGN KEY (sessionId, deviceId) REFERENCES SessionDeviceMapping(sessionId, deviceId)
  )
`);
db.exec(`
  INSERT INTO DeviceSensorConfiguration_new (sessionId, deviceId, sensorProperty, sensorType, active)
  SELECT sessionId, deviceId, sensorProperty, sensorType, active FROM DeviceSensorConfiguration
`);
db.exec('DROP TABLE DeviceSensorConfiguration');
db.exec('ALTER TABLE DeviceSensorConfiguration_new RENAME TO DeviceSensorConfiguration');

const newDdl = db
  .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='DeviceSensorConfiguration'")
  .get()?.sql;
console.log('Rebuilt DeviceSensorConfiguration (%d rows) without the Property FK.', count);
console.log('New schema:', newDdl);

db.close();
console.log('Fix complete.');
