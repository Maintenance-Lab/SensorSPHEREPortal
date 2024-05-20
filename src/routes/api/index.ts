import { Router } from "express";
import AccountRouter from "./account/index.js";
import LoginRouter from "./login.js";
import AdminRouter from "./admin/index.js";

const router = Router();

router.use("/account", AccountRouter);
router.use("/admin", AdminRouter)
router.use("/login", LoginRouter);

export default router;
