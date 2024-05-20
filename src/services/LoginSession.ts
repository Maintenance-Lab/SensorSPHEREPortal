import LoginSession, { LoginSessionModel } from "../models/LoginSession.js";
import { JWT_EXPIRESIN } from "../config.js";

export const getLoginSessionsByAccountID = (id: string): Promise<LoginSessionModel[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await LoginSession.find({ Account: id });
      const notExpired = doc.filter(({ date }) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return (diff * 1000) < JWT_EXPIRESIN;
      });
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const createLoginSession = (item: Partial<LoginSessionModel>): Promise<LoginSessionModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await LoginSession.create(item);
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteLoginSession = (id: string): Promise<LoginSessionModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await LoginSession.findByIdAndDelete(id);
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteLoginSessionsByAccountID = (id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await LoginSession.deleteMany({ Account: id });
      return resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
