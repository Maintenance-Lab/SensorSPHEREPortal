import Account, { AccountModel } from "../models/Account.js";

export const getAllAccounts = async () => {
  return new Promise(async (resolve) => {
    const results = await Account.find({});
    return resolve(results);
  });
};

export const getAccountById = async (id: string) => {
  return new Promise(async (resolve) => {
    const doc = await Account.findById(id);
    return resolve(doc);
  });
};

export const getAccountByEmail = async (email: string) => {
  return new Promise(async (resolve) => {
    const doc = await Account.find({ email });
    return resolve(doc);
  });
};

export const getAccountByName = async (name: string) => {
  return new Promise(async (resolve) => {
    const doc = await Account.find({ name });
    return resolve(doc);
  });
};

export const createAccount = async (item: Partial<AccountModel>) => {
  return new Promise(async (resolve) => {
    const result = await Account.create(item);
    return resolve(result);
  });
};

export const createAccounts = async (items: Array<Partial<AccountModel>>) => {
  return new Promise(async (resolve) => {
    const results = [];
    for (const item of items) {
      const result = await Account.create(item);
      results.push(result);
    }
    return resolve(results);
  });
};

export const updateAccount = async (id: string, item: Partial<AccountModel>) => {
  return new Promise(async (resolve, reject) => {
    if (!id) return reject(new Error("User Key not found"));

    const { _id, ...rest } = item;

    const newItem = { ...rest };

    const query = { _id: id };
    const options = {
      // Return the document after updates are applied
      new: true,
      // Create a document if one isn't found.
      upsert: false,
    };
    const result = await Account.findOneAndUpdate(query, newItem, options);
    return resolve(result);
  });
};
