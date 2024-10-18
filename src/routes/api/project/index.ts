import { Router } from 'express';
import { IS_PROD } from '../../../config.js';

import projectRouter from './project.js';
// import collaboratorRouter from './collaborator.js';

const router = Router();

router.use("/", projectRouter);
// router.use("/collaborator", collaboratorRouter);



export default router;
