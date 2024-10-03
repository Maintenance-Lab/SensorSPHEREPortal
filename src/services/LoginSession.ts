import LoginSession from "../models/LoginSession.js";
import { JWT_EXPIRESIN } from "../config.js";

export const getLoginSessionsByAccountID = (id: string): Promise<LoginSession[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await LoginSession.findAll({ where: { Account: id }});
      const notExpired = doc.filter(({ LoginSessionDate }) => {
        const now = new Date();
        const diff = now.getTime() - LoginSessionDate.getTime();
        return (diff * 1000) < JWT_EXPIRESIN;
      });
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const createLoginSession = (item: Partial<LoginSession>): Promise<LoginSession> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await LoginSession.create(item);
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteLoginSession = (id: string): Promise<LoginSession> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await LoginSession.findByPk(id);
      if (!doc) return reject(new Error("LoginSession not found"));
      await doc.destroy();

      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const deleteLoginSessionsByAccountID = (id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      await LoginSession.destroy({ where: { Account: id }});
      return resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
