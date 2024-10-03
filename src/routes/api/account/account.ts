import { Router } from "express";
import { IS_PROD, JWT_ACCESS_SECRET, JWT_EXPIRESIN } from "../../../config.js";
import { getAccountById, updateAccount } from "../../../services/Account.js";
import { getSession } from "../../../utils.js";
import { hash, verify } from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import { createLoginSession } from "../../../services/LoginSession.js";

const router = Router();

router.get("/", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  return res.json(response);
});

router.get("/pinned", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.AccountId) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account.AccountId);

  const { PinnedProjects } = dbAccount;
  return res.json(PinnedProjects);
});

router.post("/pin", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.AccountId) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account.AccountId);
  if (!dbAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { PinnedProjects } = dbAccount;
  if (!PinnedProjects) return res.status(400).json({ message: "Pinned projects is required" });

  const { projectId } = req.body;

  if (PinnedProjects.includes(projectId)) {
    return;
  }
  PinnedProjects.push(projectId);

  const updatedAccount = await updateAccount(account.AccountId, { PinnedProjects });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  return res.json(updatedAccount);
});

router.post("/unpin", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account.AccountId) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account.AccountId);
  if (!dbAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { PinnedProjects } = dbAccount;
  if (!PinnedProjects) return res.status(400).json({ message: "Pinned projects is required" });

  const { projectId } = req.body;

  PinnedProjects.splice(PinnedProjects.indexOf(projectId), 1);

  const updatedAccount = await updateAccount(account.AccountId, { PinnedProjects });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  return res.json(updatedAccount);
});

router.post("/password", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });

  let { newPass, currentPass } = req.body;
  if (!newPass || !currentPass) return res.status(400).json({ message: "Current and new password required" });
  if (newPass === currentPass) return res.status(400).json({ message: "New password cannot be the same as the current password" });

  const { AccountId } = account;
  if (!AccountId) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(AccountId);
  const { Password } = dbAccount;
  if (!Password) return res.status(500).json({ message: "Internal Server Error" });

  try {
    const valid = await verify(Password, currentPass);
    if (!valid) return res.status(400).json({ message: "Invalid current password" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid current password" });
  }

  newPass = await hash(newPass);

  const updatedAccount = await updateAccount(AccountId, { Password: newPass, HasChangedPassword: true });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { Name, Role, HasAvatar, Email, HasChangedPassword } = updatedAccount;

  const Token = jwt.sign({ AccountId, Name, Role, HasAvatar, Email, HasChangedPassword }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_EXPIRESIN,
  });

  const UserAgent = req.headers["user-agent"];
  const Ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  await createLoginSession({ Account: AccountId, Token, UserAgent, Ip });

  return res
    .cookie("token", Token, {
      secure: IS_PROD,
      maxAge: JWT_EXPIRESIN * 1000,
    })
    .json({ message: "Password updated" });
});

//

export default router;
