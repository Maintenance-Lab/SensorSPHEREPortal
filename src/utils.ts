import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IS_PROD, JWT_ACCESS_SECRET } from "./config.js";
import { AccountModel } from "./models/Account.js";
import { getLoginSessionsByAccountID } from "./services/LoginSession.js";
import { LoginSessionModel } from "./models/LoginSession.js";

const isValidObjectID = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

export const createAccountResponse = (account: Partial<AccountModel>): Partial<AccountModel> => {
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

export const createBaseAccount = (account: Partial<AccountModel>): Partial<AccountModel> => {
  console.log(account);
  return {
    _id: account._id,
    name: account.name,
    email: account.email,
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
  if (account.role !== "administrator") {
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

  const session = sessions.find((s) => s.token === cookies.token);
  if (!session) {
    res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
    return false;
  }

  return account;
};

export interface SessionResponse {
  account: Partial<AccountModel>;
  sessions: LoginSessionModel[];
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
    const session = sessions.find((s) => s.token === cookies.token);
    if (!session) {
      res.cookie("token", "", { maxAge: 0 }).status(401).send("Unauthorized");
      return false;
    }

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Check if the IP matches. We do not check user agents as this will be anoying when a browser updates.
    if (session.ip !== ip) {
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
