import { Router } from "express";
import { IS_PROD } from "../../../config.js";
import { getAccountById, updateAccount } from "../../../services/Account.js";
import { getSession } from "../../../utils.js";
import { hash, verify } from "@node-rs/argon2";

const router = Router();

router.get("/", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account, sessions } = response;
  if (!account || !sessions) return res.status(401).json({ message: "Unauthorized" });

  return res.json(response);
});

router.post("/password", async (req, res) => {
  const response = await getSession(req, res);
  if (!response) return;

  const { account } = response;
  if (!account) return res.status(401).json({ message: "Unauthorized" });

  let { newPass, currentPass } = req.body;
  if (!newPass || !currentPass) return res.status(400).json({ message: "Current and new password required" });

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

  console.log("newPass", newPass);
  newPass = await hash(newPass);

  const updatedAccount = await updateAccount(_id, { password: newPass });
  if (!updatedAccount) return res.status(500).json({ message: "Internal Server Error" });

  return res.json({ message: "Password updated" });
});

//

export default router;
