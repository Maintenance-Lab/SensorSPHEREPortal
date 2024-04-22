import { Router } from "express";
import apiRouter from "./api/index";

const routes = Router();

// routes.use("/auth", auth);
routes.use("/api", apiRouter);

export default routes;
