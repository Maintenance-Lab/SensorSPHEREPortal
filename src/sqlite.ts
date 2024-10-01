import sqlite3 from 'sqlite3';
import { SQLITE_PATH } from './config.js';

// let db: any;

// export async function dbConnect() {
// if (!db) {
const db = new sqlite3.Database(SQLITE_PATH, (err) => {
    if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    } else {
    console.log('Connected to SQLite database.');
    }
});
// }
// return db;
// }


export default db;


