import { Router } from "express";
// import AccountRouter from "./accounts.js";
import LoginRouter from "./login.js";

const router = Router();

// router.use("/accounts", AccountRouter);
router.use("/login", LoginRouter);

export default router;
