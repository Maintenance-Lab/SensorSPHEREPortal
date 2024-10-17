import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { IS_PROD, JWT_ACCESS_SECRET, JWT_EXPIRESIN } from '../../config.js';
import { createAccount, getAccountByNameOrEmail } from '../../services/Account.js';
import { verify, hash, hashSync } from '@node-rs/argon2';
import { createLoginSession } from '../../services/LoginSession.js';

const router = Router();

router.post("/", async (req, res) => {
  console.log("login route", req.body);
  const { username, password } = req.body;

  // await createAccount({ Name: "Test", Email: "admin@admin.com", Password: await hash("password123"), Role: "admin" })

  try {
    const account = await getAccountByNameOrEmail(username);
    if (!account) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    if (!account.enabled)
      return res.json({
        success: false,
        location: null,
        error: "Account is disabled, contact your system administrator",
      });

    const isValid = await verify(hashSync(account.password), password);
    if (!isValid) return res.json({ success: false, location: null, error: "Invalid login credentials" });

    const { accountId, name, role, hasAvatar, email, hasChangedPassword } = account;

    console.log("Account test", account, password)

    const token = jwt.sign({ accountId, name, role, hasAvatar, email, hasChangedPassword }, JWT_ACCESS_SECRET, {
      expiresIn: JWT_EXPIRESIN,
    });

    const userAgent = req.headers["user-agent"];
    const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    await createLoginSession({ account: accountId, token, userAgent, ip });

    console.log("RELOC")
    return res
      .cookie("token", token, {
        secure: IS_PROD,
        maxAge: JWT_EXPIRESIN * 1000,
      })
      .json({ success: true, location: "/home", error: null });
  } catch (error) {
    return res.json({ success: false, location: null, error: "Error logging in, please try again later" });
    // if (!IS_PROD) console.error("Error logging in", error);
    // return res.json({ success: false, location: null, error: "Error logging in, please try again later" });
  }
});

export default router;
