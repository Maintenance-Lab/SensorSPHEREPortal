import { Router } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET, JWT_EXPIRESIN } from "../../config.js";
import { createAccount, getAccountByNameOrEmail } from "../../services/Account.js";
import { verify, hash } from "@node-rs/argon2";
import { createLoginSession } from "../../services/LoginSession.js";

const router = Router();

router.post("/", async (req, res) => {
  console.log("login route", req.body);
  const { username, password } = req.body;

  // await createAccount({ name: "admin", email: "admin@admin.com", password: await hash("admin"), role: "administrator" })

  try {
    const account = await getAccountByNameOrEmail(username);
    if (!account) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    if (!account.Enabled)
      return res.json({
        success: false,
        location: null,
        error: "Account is disabled, contact your system administrator",
      });

    const isValid = await verify(account.Password, password);
    if (!isValid) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    const { AccountId, Name, Role, HasAvatar, Email, HasChangedPassword } = account;

    const Token = jwt.sign({ AccountId, Name, Role, HasAvatar, Email, HasChangedPassword }, JWT_ACCESS_SECRET, {
      expiresIn: JWT_EXPIRESIN,
    });

    const UserAgent = req.headers["user-agent"];
    const Ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    await createLoginSession({ Account: AccountId, Token, UserAgent, Ip });

    return res
      .cookie("Token", Token, {
        secure: IS_PROD,
        maxAge: JWT_EXPIRESIN * 1000,
      })
      .json({ success: true, location: "/home", error: null });
  } catch (error) {
    if (!IS_PROD) console.error("Error logging in", error);
    return res.json({ success: false, location: null, error: "Error logging in, please try again later" });
  }
});

export default router;
