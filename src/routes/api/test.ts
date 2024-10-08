import { Router } from "express";
// import database from "../../sqlite.js";
import db from "../../sqlite.js";

const router = Router();

router.get("/testing", async (_, res) => {


//     console.log("testing spannend!!!");
//     console.log("db", db);

// Get project names for account 1

    db.all('SELECT * FROM Project JOIN AccountProjectMapping ON Project.ProjectID = AccountProjectMapping.ProjectID WHERE AccountProjectMapping.AccountID = 1;', (err, rows) => {

        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log("ROWS: ", rows);
        return res.json(rows);
    });
});

export default router;