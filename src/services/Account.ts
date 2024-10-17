import e from 'express';
import Account from '../models/Account.js';
import { Op } from 'sequelize';
// import {Account, AccountModel} from '../models/Account";
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

// where: {LastName: "Doe", $or: [{FirstName:{ $eq: "John"}}]
// {where: {LastName: "Doe",$or: [{FirstName:{$eq: "John"}} ]} }

export const getAccountByNameOrEmail = (input: string): Promise<Account> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = await Account.findOne({where: {[Op.or]: [{ name: input },{ email: input }]}})
      if (!doc) return reject(new Error("Account not found"));
      else {
        return resolve(doc);
      }
    } catch (error) {
      reject(error);
    }
  });



  // return new Promise(async (resolve, reject) => {
  //   console.log("input", input);
  //   try {
  //       const doc = await Account.findOne({ where: { name: input }});
  //       // console.log("doc", doc);
  //       if (doc != null) {
  //         return resolve(doc);
  //       }
  //   } catch (error) {
  //     console.log("error", error);
  //     reject(error);
  //   }
  // });
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

      const { accountId, ...rest } = item;
      const newItem = { ...rest };
      const query = { _id: accountId };

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
