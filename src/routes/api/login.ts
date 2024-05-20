import { Router } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET, JWT_EXPIRESIN } from "../../config.js";
import { getAccountByNameOrEmail } from "../../services/Account.js";
import { verify } from "@node-rs/argon2";
import { createLoginSession } from "../../services/LoginSession.js";

const router = Router();

router.post("/", async (req, res) => {
  console.log("login route", req.body);
  const { username, password } = req.body;

  try {
    const account = await getAccountByNameOrEmail(username);
    if (!account) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    if (!account.enabled)
      return res.json({
        success: false,
        location: null,
        error: "Account is disabled, contact your system administrator",
      });

    const isValid = await verify(account.password, password);
    if (!isValid) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    const { _id, name, role, hasAvatar, email } = account;

    const token = jwt.sign({ _id, name, role, hasAvatar, email }, JWT_ACCESS_SECRET, {
      expiresIn: JWT_EXPIRESIN,
    });

    const userAgent = req.headers["user-agent"];
    const ip: any = req.socket.remoteAddress || req.headers["x-forwarded-for"];

    await createLoginSession({ Account: _id, token, userAgent, ip });

    return res
      .cookie("token", token, {
        secure: IS_PROD,
        maxAge: JWT_EXPIRESIN * 1000,
      })
      .json({ success: true, location: "/dashboards", error: null });
  } catch (error) {
    if (!IS_PROD) console.error("Error logging in", error);
    return res.json({ success: false, location: null, error: "Error logging in, please try again later" });
  }
});

export default router;
