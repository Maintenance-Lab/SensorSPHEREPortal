import e, { Router } from "express";
import sqlite3 from 'sqlite3';

const router = Router();

router.get("/testing", async (_, res) => {
    console.log("testing");

    const db = new sqlite3.Database("./db.sqlite3");

    // get all authors
    db.serialize(() => {
        db.all('SELECT * FROM authors', (err: Error, rows: any[]) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log(rows);
            return res.json(rows);
        });
    });

    // close the database connection
    db.close();
  });


export default router;