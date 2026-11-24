import {Router} from 'express';
import {IS_PROD} from '../../../config.js';
import {createAccount, getAllAccounts, updateAccount} from '../../../services/account.js';
import {deleteAllLoginSessionsByAccountID} from '../../../services/loginSession.js';
import {hash} from '@node-rs/argon2';
import {handleMongoError, isEmail, isPasswordStrong} from '../../../tools/utils.js';
import mongoose from 'mongoose';
import {isAdmin, createAccountResponse} from '../../../utils.js';

const AdminAccountRouter = Router();

AdminAccountRouter.get("/", async (req, res) => {
    try {
        if (!(await isAdmin(req, res))) return;

        const accounts = await getAllAccounts();
        const responseAccounts = accounts.map((account: any) => {
            return createAccountResponse(account);
        });

        return res.json({success: true, error: null, accounts: responseAccounts});
    } catch (error: any) {
        if (error instanceof mongoose.mongo.MongoError) {
            const message = handleMongoError(error);
            return res.json({success: false, error: message});
        } else {
            if (!IS_PROD) console.error("Error getting accounts", error.message);
            return res.json({success: false, error: IS_PROD ? "Internal Server Error" : error.message});
        }
    }
});

AdminAccountRouter.post("/create", async (req, res) => {
    try {
        const account = await isAdmin(req, res);
        if (!account) return;

        const {name, email, role, password} = req.body;
        if (!name || !email || !role || !password) {
            return res.json({success: false, error: "Missing fields"});
        }
        if (typeof email !== "string" || !isEmail(email)) {
            return res.json({success: false, error: "Invalid email address"});
        }
        if (typeof password !== "string" || !isPasswordStrong(password)) {
            return res.json({success: false, error: "Password must be between 15 and 128 characters long"});
        }

        const hashedPassword = await hash(password);
        const newAccount = await createAccount({
            name,
            email,
            role,
            password: hashedPassword,
            hasChangedPassword: false,
        });

        const resposeAccount = createAccountResponse(newAccount);
        if (!resposeAccount) return res.json({success: false, error: "Error creating account"});

        return res.json({success: true, error: null, account: resposeAccount});
    } catch (error: any) {
        if (error instanceof mongoose.mongo.MongoError) {
            const message = handleMongoError(error);
            return res.json({success: false, error: message});
        } else {
            if (!IS_PROD) console.error("Error creating account", error.message);
            return res.json({success: false, error: IS_PROD ? "Internal Server Error" : error.message});
        }
    }
});

AdminAccountRouter.post("/update", async (req, res) => {
    try {
        const account = await isAdmin(req, res);
        if (!account) return;

        const {accountId, _id, name, email, role, enabled, password} = req.body;
        const targetId = accountId ?? _id;
        if (targetId === undefined || targetId === null) {
            return res.status(400).json({success: false, error: "Account ID is required"});
        }

        const updates: Record<string, any> = {};
        if (typeof name === "string" && name.trim()) updates.name = name.trim();
        if (typeof email === "string") {
            if (!isEmail(email)) return res.json({success: false, error: "Invalid email address"});
            updates.email = email;
        }
        if (typeof role === "string" && role.trim()) updates.role = role.trim();
        if (typeof enabled === "boolean") updates.enabled = enabled;

        if (password !== undefined && password !== "") {
            if (typeof password !== "string" || !isPasswordStrong(password)) {
                return res.json({success: false, error: "Password must be between 15 and 128 characters long"});
            }
            updates.password = await hash(password);
            updates.hasChangedPassword = false;
        }

        const updatedAccount: any = await updateAccount(targetId, updates);
        if (updates.password) {
            await deleteAllLoginSessionsByAccountID(targetId);
        }

        const responseAccount = createAccountResponse(updatedAccount);

        return res.json({success: true, error: null, account: responseAccount});
    } catch (error: any) {
        if (error instanceof mongoose.mongo.MongoError) {
            const message = handleMongoError(error);
            return res.json({success: false, error: message});
        } else {
            if (!IS_PROD) console.error("Error updating account", error.message);
            return res.json({success: false, error: IS_PROD ? "Internal Server Error" : error.message});
        }
    }
});

export default AdminAccountRouter;
