import LoginSession from '../models/LoginSession.js';
import { JWT_EXPIRESIN } from '../config.js';

export const getLoginSessionsByAccountID = (id: number): Promise<LoginSession[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await LoginSession.findAll({ where: { Account: id }});
      const notExpired = doc.filter(({ loginSessionDate }) => {
        // This casting can be removed if loginSessionDate is correctly a Date during run time.
        if (!(loginSessionDate instanceof Date)) {
          loginSessionDate = new Date(loginSessionDate);
        }
        const now = new Date();
        const diff = now.getTime() - loginSessionDate.getTime();
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

export const deleteLoginSession = (id: number): Promise<LoginSession> => {
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

export const deleteLoginSessionsByAccountID = (id: number) => {
  return new Promise(async (resolve, reject) => {
    try {
      await LoginSession.destroy({ where: { Account: id }});
      return resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
