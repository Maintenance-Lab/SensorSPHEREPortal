import { Router } from 'express';
import AdminAccountRouter from './accounts.js';

const AdminRouter = Router();

AdminRouter.use("/accounts", AdminAccountRouter);

export default AdminRouter;
