import { Router } from "express";
import { IS_PROD } from "../../../config.js";
import { createAccount, getAllAccounts, updateAccount } from "../../../services/Account.js";
import { hash } from "@node-rs/argon2";
import { handleMongoError } from "../../../tools/utils.js";
import mongoose from "mongoose";
import { isAdmin, createAccountResponse } from "../../../utils.js";

const AdminAccountRouter = Router();

AdminAccountRouter.get("/", async (req, res) => {
  try {
    if (!(await isAdmin(req, res))) return;

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
    const account = await isAdmin(req, res);
    if (!account) return;

    const { name, email, role, password } = req.body;
    if (!name || !email || !role || !password) return res.json({ success: false, error: "Missing fields" });

    const hashedPassword = await hash(password);
    const newAccount = await createAccount({ name, email, role, password: hashedPassword, createdBy: account._id });

    const resposeAccount = createAccountResponse(newAccount);
    if (!resposeAccount) return res.json({ success: false, error: "Error creating account" });
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
    const account = await isAdmin(req, res);
    if (!account) return;

    const { _id, ...rest } = req.body;
    if (!_id) return res.status(400);

    if (rest.password) rest.password = await hash(rest.password);

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
