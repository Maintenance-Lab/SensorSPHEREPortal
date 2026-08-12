// One-time migration: scope Property rows to the sensor module they came from.
//
// Rebuilds the Property table with a composite primary key of
// (name, sensorType, moduleName, moduleManufacturer) and backfills module
// context for existing rows. Also rebuilds DeviceSensorConfiguration so each
// device only gets the properties of its own modules.
//
// Run with: node scripts/migrate_properties.js
import { DatabaseSync } from 'node:sqlite';
import { copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'database', 'db.sqlite3');

// Property name -> module it belongs to. Populated from the modules known to
// the database at migration time. Rows that are not listed here are reported
// at the end and left out of the rebuilt table.
const ATTRIBUTION = {
  acceleration_x: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  acceleration_y: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  acceleration_z: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  gyroscope_x: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  gyroscope_y: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  gyroscope_z: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  temperature: { moduleName: 'IMU_int', moduleManufacturer: 'M5Stack' },
  'ph0.rms': { moduleName: 'SCT013-3Phase', moduleManufacturer: 'HvA' },
  'ph1.rms': { moduleName: 'SCT013-3Phase', moduleManufacturer: 'HvA' },
  'ph2.rms': { moduleName: 'SCT013-3Phase', moduleManufacturer: 'HvA' },
};

const db = new DatabaseSync(DB_PATH, { enableForeignKeyConstraints: false });

// 1. Backup
const backupPath = `${DB_PATH}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
copyFileSync(DB_PATH, backupPath);
console.log('Backup created at', backupPath);

// 2. Rebuild Property with module-scoped primary key.
// Use a temp table + drop + rename instead of ALTER RENAME so SQLite does not
// rewrite foreign-key references to the old table name.
const oldRows = db
  .prepare('SELECT name, sensorType, unit, accuracy, rangeMin, rangeMax FROM Property')
  .all();

db.exec(`
  CREATE TABLE Property_new (
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
  )
`);

const insertProperty = db.prepare(`
  INSERT INTO Property_new (name, sensorType, moduleName, moduleManufacturer, unit, accuracy, rangeMin, rangeMax)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const unmatched = [];
for (const row of oldRows) {
  const module = ATTRIBUTION[row.name];
  if (!module) {
    unmatched.push(row.name);
    continue;
  }
  insertProperty.run(
    row.name,
    row.sensorType,
    module.moduleName,
    module.moduleManufacturer,
    row.unit,
    row.accuracy,
    row.rangeMin,
    row.rangeMax,
  );
}

// Clear the config rows that reference Property before dropping it
db.exec('DELETE FROM DeviceSensorConfiguration');

db.exec('DROP TABLE Property');
db.exec('ALTER TABLE Property_new RENAME TO Property');
console.log(
  `Rebuilt Property table (${oldRows.length - unmatched.length} rows migrated).`,
  unmatched.length ? `Unmatched and skipped: ${unmatched.join(', ')}` : 'No unmatched rows.',
);

// 3. Rebuild DeviceSensorConfiguration from the module-scoped properties
const sessionMappings = db
  .prepare('SELECT sessionId, deviceId FROM SessionDeviceMapping')
  .all();
const deviceModules = db
  .prepare('SELECT deviceId, moduleName, moduleManufacturer, sensorType FROM DeviceModuleMapping')
  .all();

const selectProperties = db.prepare(`
  SELECT name, sensorType FROM Property
  WHERE sensorType = ? AND moduleName = ? AND moduleManufacturer = ?
`);
const insertConfig = db.prepare(`
  INSERT INTO DeviceSensorConfiguration (sessionId, deviceId, sensorProperty, sensorType, active)
  VALUES (?, ?, ?, ?, ?)
`);

let configCount = 0;
for (const mapping of sessionMappings) {
  const modules = deviceModules.filter((m) => m.deviceId === mapping.deviceId);
  for (const mod of modules) {
    const properties = selectProperties.all(mod.sensorType, mod.moduleName, mod.moduleManufacturer);
    for (const prop of properties) {
      insertConfig.run(mapping.sessionId, mapping.deviceId, prop.name, prop.sensorType, 1);
      configCount++;
    }
  }
}
console.log(`Recreated ${configCount} DeviceSensorConfiguration rows.`);

console.log('\nResulting properties per device:');
const devices = db.prepare('SELECT deviceId FROM DeviceModuleMapping').all();
for (const device of devices) {
  const rows = db
    .prepare(`
      SELECT dmm.moduleName, dmm.moduleManufacturer, p.name
      FROM DeviceModuleMapping dmm
      JOIN Property p ON p.sensorType = dmm.sensorType AND p.moduleName = dmm.moduleName AND p.moduleManufacturer = dmm.moduleManufacturer
      WHERE dmm.deviceId = ?
    `)
    .all(device.deviceId);
  console.log(`  ${device.deviceId}:`);
  for (const row of rows) {
    console.log(`    - ${row.moduleName} (${row.moduleManufacturer}): ${row.name}`);
  }
}

db.close();
console.log('\nMigration complete.');
