import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET } from "./config.js";
import Account from "./models/Account.js";
import { getLoginSessionsByAccountID } from "./services/LoginSession.js";
import LoginSession from "./models/LoginSession.js";

const isValidObjectID = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const createAccountResponse = (account: Partial<Account>): Partial<Account> => {
  // let { AccountId, Enabled, Name, Email, Meta, CreatedAt, HasChangedPassword, Role, HasAvatar } = account;
  // if (createdBy && typeof createdBy === "object") createdBy = createdBy.name || "System";
  const { AccountId, Enabled, Name, Email, Meta, CreatedAt, HasChangedPassword, Role, HasAvatar } = account;
  return {
    AccountId,
    Enabled,
    Name,
    Email,
    Meta,
    CreatedAt,
    HasChangedPassword,
    Role,
    HasAvatar,
  };
};

export const createBaseAccount = (account: Partial<Account>): Partial<Account> => {
  console.log(account);
  return {
    AccountId: account.AccountId,
    Name: account.Name,
    Email: account.Email,
  };
}

export const isAdmin = async (req: Request, res: Response) => {
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
  if (account.Role !== "administrator") {
    res.status(403).send("Forbidden");
    return false;
  }

  const { _id } = account;
  if (!isValidObjectID(_id)) {
    res.status(401).send("Unauthorized");
    return false;
  }

  const sessions = await getLoginSessionsByAccountID(_id);
  if (!sessions) {
    res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
    return false;
  }

  const session = sessions.find((s) => s.Token === cookies.token);
  if (!session) {
    res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
    return false;
  }

  return account;
};

export interface SessionResponse {
  account: Partial<Account>;
  sessions: LoginSession[];
}

export const getSession = async (req: Request, res: Response): Promise<SessionResponse | false> => {
  try {
    const cookies = req.cookies || {};

    if (!cookies.token) {
      res.status(401).send("Unauthorized");
      return false;
    }

    const account: any = jwt.verify(cookies.token, JWT_ACCESS_SECRET);
    if (!account) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    const { _id } = account;
    if (!isValidObjectID(_id)) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    // Get the login sessions for the account
    const sessions = await getLoginSessionsByAccountID(_id);
    if (!sessions) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    // Find the session that matches the token
    const session = sessions.find((s) => s.Token === cookies.token);
    if (!session) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if the IP matches. We do not check user agents as this will be anoying when a browser updates.
    if (session.Ip !== ip) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    return { account, sessions };
  } catch (error: any) {
    if (!IS_PROD) console.error("Error verifying session", error.message);
    res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
    return false;
  }
};
