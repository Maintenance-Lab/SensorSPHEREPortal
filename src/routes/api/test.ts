import { Router } from "express";
// import database from "../../sqlite.js";
import db from "../../sqlite.js";

const router = Router();

router.get("/testing", async (_, res) => {


//     console.log("testing spannend!!!");
//     console.log("db", db);

    db.all('SELECT * FROM Sensor', (err: Error, rows: any[]) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("ROWS: ", rows);
        return res.json(rows);
    });

//     db.all('SELECT * FROM books', (err: Error, rows: any[]) => {
//         if (err) {
//             console.error(err.message);
//             return res.status(500).json({ error: err.message });
//         }
//         console.log("ROWS: ", rows);
//         return res.json(rows);
//     });
});

export default router;