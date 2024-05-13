import Account, { AccountModel } from "../models/Account.js";

export const getAllAccounts = (): Promise<AccountModel[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const results: any = await Account.find({}).populate("createdBy");
      return resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountById = (id: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findById(id);
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByEmail = (email: string): Promise<AccountModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({ email });
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByName = (name: string): Promise<AccountModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({ name });
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByNameOrEmail = (input: string): Promise<AccountModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({ $or: [{ name: input }, { email: input }] });
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const createAccount = (item: Partial<AccountModel>): Promise<AccountModel> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Account.create(item);
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const createAccounts = (items: Array<Partial<AccountModel>>) => {
  return new Promise(async (resolve, reject) => {
    try {
      const results = [];
      for (const item of items) {
        const result = await Account.create(item);
        results.push(result);
      }
      return resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

export const updateAccount = (id: string, item: Partial<AccountModel>) => {
  return new Promise(async (resolve, reject) => {
    try {
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
      const result = await Account.findOneAndUpdate(query, newItem, options).populate("createdBy");
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
