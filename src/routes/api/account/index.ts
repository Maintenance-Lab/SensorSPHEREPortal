import { Router } from 'express';
import accountRoutes from './account.js';
import sessionRoutes from './session.js';

const AccountRouter = Router();

AccountRouter.use("/", accountRoutes);
AccountRouter.use("/session", sessionRoutes);

export default AccountRouter;
