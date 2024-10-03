import Account from "../models/Account.js";
// import {Account, AccountModel} from "../models/Account";
// Als je dit weghaald krijg je errors bij find

export const getAllAccounts = (): Promise<Account[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const results: any = await Account.findAll();
      return resolve(results);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountById = (id: number): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findByPk(id);
      if (!doc) return reject(new Error("Account not found"));
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByEmail = (email: string): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({ where: { email }});
      if (!doc) return reject(new Error("Account not found"));
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByName = (name: string): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({ where: { name }});
      if (!doc) return reject(new Error("Account not found"));
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAccountByNameOrEmail = (input: string): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({where: { $or: [{ Name: input }, { Email: input }] }});
      if (!doc) return reject(new Error("Account not found"));
      return resolve(doc);
    } catch (error) {
      reject(error);
    }
  });
};

export const createAccount = (item: Partial<Account>): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Account.create(item);
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};

export const createAccounts = (items: Array<Partial<Account>>) => {
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

export const updateAccount = (id: number, item: Partial<Account>): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!id) return reject(new Error("User Key not found"));

      const { AccountId, ...rest } = item;
      const newItem = { ...rest };
      const query = { _id: AccountId };

      // const options = {
      //   // Return the document after updates are applied
      //   new: true,
      //   // Create a document if one isn't found.
      //   upsert: false,
      // };
      // const result = await Account.findOneAndUpdate(query, newItem, options).populate("createdBy");

      const result = await Account.findOne({ where: query});
      if (!result) return reject(new Error("Account not found"));
      result.update(newItem);
      return resolve(result);
    } catch (error) {
      reject(error);
    }
  });
};
