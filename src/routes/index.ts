import { Router } from 'express';
import apiRouter from './api/index.js';

const routes = Router();

// routes.use("/auth", auth);
routes.use("/api", apiRouter);

export default routes;
