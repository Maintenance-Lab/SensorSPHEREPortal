import { Router } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET } from "../../../config.js";
import { createAccount, getAllAccounts, updateAccount } from "../../../services/Account.js";
import { hash } from "@node-rs/argon2";
import { handleMongoError } from "../../../tools/utils.js";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { AccountModel } from "../../../models/Account.js";

const AdminAccountRouter = Router();

const createAccountResponse = (account: Partial<AccountModel>): Partial<AccountModel> => {
  let { _id, enabled, name, email, meta, createdBy, createdAt, hasChangedPassword, role, hasAvatar } = account;
  if (createdBy && typeof createdBy === "object") createdBy = createdBy.name || "System";
  return {
    _id,
    enabled,
    name,
    email,
    meta,
    createdBy,
    createdAt,
    hasChangedPassword,
    role,
    hasAvatar,
  };
};

const isAdmin = (req: Request, res: Response) => {
  const cookies = req.cookies || {};

  if (!cookies.token) {
    res.status(401).send("Unauthorized");
    return false;
  }

  const account: any = jwt.verify(cookies.token, JWT_ACCESS_SECRET);
  if (!account) {
    res.status(401).send("Unauthorized");
    return false;
  }
  if (account.role !== "administrator") {
    res.status(403).send("Forbidden");
    return false;
  }
  return account;
};

AdminAccountRouter.get("/", async (req, res) => {
  try {
    if (!isAdmin(req, res)) return;

    const accounts = await getAllAccounts();
    const responseAccounts = accounts.map((account: any) => {
      return createAccountResponse(account);
    });

    return res.json({ success: true, error: null, accounts: responseAccounts });
  } catch (error: any) {
    if (error instanceof mongoose.mongo.MongoError) {
      const message = handleMongoError(error);
      return res.json({ success: false, error: message });
    } else {
      if (!IS_PROD) console.error("Error getting accounts", error.message);
      return res.json({ success: false, error: error.message });
    }
  }
});

AdminAccountRouter.post("/create", async (req, res) => {
  try {
    const account = isAdmin(req, res);
    if (!account) return;

    const { name, email, role } = req.body;
    if (!name || !email || !role) return res.status(400);

    // TODO: Create random password, mail it to user
    const password = await hash("password");
    const newAccount = await createAccount({ name, email, role, password, createdBy: account._id });

    const resposeAccount = createAccountResponse(newAccount);
    if (!resposeAccount) return res.status(500);
    resposeAccount["createdBy"] = account.name || "System";

    return res.json({ success: true, error: null, account: resposeAccount });
  } catch (error: any) {
    if (error instanceof mongoose.mongo.MongoError) {
      const message = handleMongoError(error);
      return res.json({ success: false, error: message });
    } else {
      if (!IS_PROD) console.error("Error creating account", error.message);
      return res.json({ success: false, error: error.message });
    }
  }
});

AdminAccountRouter.post("/update", async (req, res) => {
  try {
    const account = isAdmin(req, res);
    if (!account) return;

    const { _id, ...rest } = req.body;
    if (!_id) return res.status(400);

    const updatedAccount: any = await updateAccount(_id, rest);
    const resposeAccount = createAccountResponse(updatedAccount);

    return res.json({ success: true, error: null, account: resposeAccount });
  } catch (error: any) {
    if (error instanceof mongoose.mongo.MongoError) {
      const message = handleMongoError(error);
      return res.json({ success: false, error: message });
    } else {
      if (!IS_PROD) console.error("Error updating account", error.message);
      return res.json({ success: false, error: error.message });
    }
  }
});

export default AdminAccountRouter;
