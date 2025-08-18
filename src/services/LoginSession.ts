import LoginSession from '../models/LoginSession.js';
import { JWT_EXPIRESIN } from '../config.js';

export const getLoginSessionsByAccountID = async (id: number): Promise<LoginSession[]> => {
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
    return doc;
  } catch (error) {
    throw error;
  }
};

export const createLoginSession = async (item: Partial<LoginSession>): Promise<LoginSession> => {
  try {
    const result = await LoginSession.create(item);
    return result;
  } catch (error) {
    throw error;
  }
};

export const deleteLoginSession = async (id: number): Promise<LoginSession> => {
  try {
    const doc = await LoginSession.findByPk(id);
    if (!doc) throw new Error("LoginSession not found");
    await doc.destroy();

    return doc;
  } catch (error) {
    throw error;
  }
};

export const deleteLoginSessionsByAccountID = async (id: number) => {
  try {
    await LoginSession.destroy({ where: { Account: id }});
    return true;
  } catch (error) {
    throw error;
  }
};
