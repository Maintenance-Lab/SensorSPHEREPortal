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
  if (!account._id) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account._id);

  const { pinnedProjects } = dbAccount;
  return res.json(pinnedProjects);
});

router.post("/pin", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account._id) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account._id);
  if (!dbAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { pinnedProjects } = dbAccount;
  if (!pinnedProjects) return res.status(400).json({ message: "Pinned projects is required" });

  const { projectId } = req.body;

  if (pinnedProjects.includes(projectId)) {
    return;
  }
  pinnedProjects.push(projectId);

  const updatedAccount = await updateAccount(account._id, { pinnedProjects });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  return res.json(updatedAccount);
});

router.post("/unpin", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });
  if (!account._id) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(account._id);
  if (!dbAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { pinnedProjects } = dbAccount;
  if (!pinnedProjects) return res.status(400).json({ message: "Pinned projects is required" });

  const { projectId } = req.body;

  pinnedProjects.splice(pinnedProjects.indexOf(projectId), 1);

  const updatedAccount = await updateAccount(account._id, { pinnedProjects });
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

  const { _id } = account;
  if (!_id) return res.status(400).json({ message: "Account ID is required" });

  const dbAccount = await getAccountById(_id);
  const { password } = dbAccount;
  if (!password) return res.status(500).json({ message: "Internal Server Error" });

  try {
    const valid = await verify(password, currentPass);
    if (!valid) return res.status(400).json({ message: "Invalid current password" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid current password" });
  }

  newPass = await hash(newPass);

  const updatedAccount = await updateAccount(_id, { password: newPass, hasChangedPassword: true });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  const { name, role, hasAvatar, email, hasChangedPassword } = updatedAccount;

  const token = jwt.sign({ _id, name, role, hasAvatar, email, hasChangedPassword }, JWT_ACCESS_SECRET, {
    expiresIn: JWT_EXPIRESIN,
  });

  const userAgent = req.headers["user-agent"];
  const ip: any = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  await createLoginSession({ Account: _id, token, userAgent, ip });

  return res
    .cookie("token", token, {
      secure: IS_PROD,
      maxAge: JWT_EXPIRESIN * 1000,
    })
    .json({ message: "Password updated" });
});

//

export default router;
