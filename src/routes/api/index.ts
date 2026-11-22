import { Router } from 'express';
import AccountRouter from './account/index.js';
import LoginRouter from './login.js';
import AdminRouter from './admin/index.js';
import DeviceRouter from './devices.js';
import ProjectsRouter from './projects.js';
import ProjectRouter from './project/index.js';
import SessionRouter from './sessions.js';
import StatusRouter from './status.js';
import TestRouter from './test.js';
import { getSession } from '../../utils.js';
// import MQTTRouter from './mqtt.js';

const router = Router();

router.use(async (req, res, next) => {
    const allowedPaths = ["/login", "/account", "/account/password"];
    if (allowedPaths.includes(req.path)) {
        return next();
    }

    const response = await getSession(req, res);
    if (!response) return;

    if (response.account && response.account.hasChangedPassword === false) {
        return res.status(403).json({
            message: "Password change required before accessing this resource",
            requiresPasswordChange: true,
        });
    }

    return next();
});

router.use("/account", AccountRouter);
router.use("/admin", AdminRouter);
router.use("/devices", DeviceRouter);
router.use("/login", LoginRouter);
router.use("/projects", ProjectsRouter);
router.use("/project", ProjectRouter);
router.use("/sessions", SessionRouter);
router.use("/status", StatusRouter);
router.use("/test", TestRouter);
// router.use("/mqtt", MQTTRouter);

export default router;
