import { Router } from "express";
// import AccountRouter from "./accounts.js";
import LoginRouter from "./login.js";
import AdminRouter from "./admin/index.js";

const router = Router();

// router.use("/accounts", AccountRouter);
router.use("/admin", AdminRouter)
router.use("/login", LoginRouter);

export default router;
