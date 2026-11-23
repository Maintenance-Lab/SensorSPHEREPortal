import {Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import {IS_PROD, JWT_ACCESS_SECRET} from './config.js';
import Account from './models/Account.js';
import {getLoginSessionsByAccountID} from './services/loginSession.js';
import LoginSession from './models/LoginSession.js';

const isValidObjectID = (id: number): boolean => {
    return Number.isInteger(id) && id >= 0 && id <= 100000000;
};

export const createAccountResponse = (account: Partial<Account>): Partial<Account> => {
    const {accountId, enabled, name, email, meta, createdAt, hasChangedPassword, role, hasAvatar} = account;
    return {
        accountId,
        enabled,
        name,
        email,
        meta,
        createdAt,
        hasChangedPassword,
        role,
        hasAvatar,
    };
};

export const createBaseAccount = (account: Partial<Account>): Partial<Account> => {
    return {
        accountId: account.accountId,
        name: account.name,
        email: account.email,
    };
}

export interface SessionResponse {
    account: Partial<Account>;
    sessions: LoginSession[];
}

export const getSession = async (
    req: Request,
    res: Response,
    allowUnchangedPassword = false
): Promise<SessionResponse | false> => {
    try {
        const cookies = req.cookies || {};

        if (!cookies.token) {
            res.status(401).send("Unauthorized");
            return false;
        }

        const account: any = jwt.verify(cookies.token, JWT_ACCESS_SECRET);
        if (!account) {
            res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
            return false;
        }

        if (!allowUnchangedPassword && account.hasChangedPassword === false) {
            res.status(403).json({message: "Password change required"});
            return false;
        }

        const {accountId} = account;
        if (!isValidObjectID(accountId)) {
            res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
            return false;
        }


        // Get the login sessions for the account
        const sessions = await getLoginSessionsByAccountID(accountId);
        if (!sessions) {
            res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
            return false;
        }

        // Find the session that matches the token
        const session = sessions.find((s) => s.token === cookies.token);
        if (!session) {
            res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
            return false;
        }

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        // Check if the IP matches. We do not check user agents as this will be anoying when a browser updates.
        if (session.ip !== ip) {
            res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
            return false;
        }

        return {account, sessions};
    } catch (error: any) {
        if (!IS_PROD) console.error("Error verifying session", error.message);
        res.cookie("token", "", {maxAge: 0}).status(401).send("Unauthorized");
        return false;
    }
};

export const isAdmin = async (req: Request, res: Response) => {
    const sessionResponse = await getSession(req, res);
    if (!sessionResponse) return false;

    const {account} = sessionResponse;
    if (account.role !== "administrator" && account.role !== "admin") {
        res.status(403).send("Forbidden");
        return false;
    }

    return account;
};