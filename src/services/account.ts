import Account from '../models/Account.js';
import { Op } from 'sequelize';
// import {Account, AccountModel} from '../models/Account";
// Als je dit weghaald krijg je errors bij find

export const getAllAccounts = async (): Promise<Account[]> => {
  try {
    const results: any = await Account.findAll();
    return results;
  } catch (error) {
    throw error;
  }
};

export const getAccountById = async (id: number): Promise<Account> => {
  try {
    const doc = await Account.findByPk(id);
    if (!doc) throw new Error("Account not found");
    return doc;
  } catch (error) {
    throw error;
  }
};

export const getAccountByEmail = async (email: string): Promise<Account> => {
  try {
    const doc = await Account.findOne({ where: { email }});
    if (!doc) throw new Error("Account not found");
    return doc;
  } catch (error) {
    throw error;
  }
};

export const getAccountByName = async (name: string): Promise<Account> => {
  try {
    const doc = await Account.findOne({ where: { name }});
    if (!doc) throw new Error("Account not found");
    return doc;
  } catch (error) {
    throw error;
  }
};

// where: {LastName: "Doe", $or: [{FirstName:{ $eq: "John"}}]
// {where: {LastName: "Doe",$or: [{FirstName:{$eq: "John"}} ]} }

export const getAccountByNameOrEmail = async (input: string): Promise<Account> => {
  try {
    const doc = await Account.findOne({where: {[Op.or]: [{ name: input },{ email: input }]}})
    if (!doc) throw new Error("Account not found");
    else {
      return doc;
    }
  } catch (error) {
    throw error;
  }

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

export const createAccount = async (item: Partial<Account>): Promise<Account> => {
  try {
    const result = await Account.create(item);
    return result;
  } catch (error) {
    throw error;
  }
};

export const createAccounts = async (items: Array<Partial<Account>>) => {
  try {
    const results = [];
    for (const item of items) {
      const result = await Account.create(item);
      results.push(result);
    }
    return results;
  } catch (error) {
    throw error;
  }
};

export const updateAccount = async (id: number, item: Partial<Account>): Promise<Account> => {
  try {
    if (!id) throw new Error("User Key not found");

    // const options = {
    //   // Return the document after updates are applied
    //   new: true,
    //   // Create a document if one isn't found.
    //   upsert: false,
    // };
    // const result = await Account.findOneAndUpdate(query, newItem, options).populate("createdBy");

    const result = await Account.findOne({ where: { accountId: id }});
    console.log("Result", result);
    if (!result) throw new Error("Account not found");
    result.update(item);
    return result;
  } catch (error) {
    throw error;
  }
};
