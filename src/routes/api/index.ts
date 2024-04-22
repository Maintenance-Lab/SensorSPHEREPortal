import { Router } from "express";
import AccountRouter from "./accounts";

const router = Router();

router.use("/accounts", AccountRouter);

export default router;
