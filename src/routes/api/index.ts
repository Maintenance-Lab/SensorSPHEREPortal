import { Router } from "express";
import AccountRouter from "./account/index.js";
import LoginRouter from "./login.js";
import AdminRouter from "./admin/index.js";
import ProjectsRouter from "./projects.js";
import ProjectRouter from "./project/index.js";

const router = Router();

router.use("/account", AccountRouter);
router.use("/admin", AdminRouter)
router.use("/login", LoginRouter);
router.use("/projects", ProjectsRouter);
router.use("/project", ProjectRouter);

export default router;
