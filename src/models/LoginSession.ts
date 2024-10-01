import mongoose, { Schema } from "mongoose";
import { AccountModel } from "./Account";
const { ObjectId } = Schema.Types;

export interface LoginSessionModel {
  _id?: string;
  Account: AccountModel | string;
  date: Date;
  userAgent: string;
  ip: string;
  token: string;
}

// // sqlite version
// const LoginSessionSchem  = new Schema({
//   date: { type: Date, default: Date.now },
//   Account: { type: ObjectId, ref: "Account" },
//   userAgent: { type: String, required: true },
//   ip: { type: String, required: true },
//   token: { type: String, required: true },
// });

const LoginSessionSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  Account: { type: ObjectId, ref: "Account" },
  userAgent: { type: String, required: true },
  ip: { type: String, required: true },
  token: { type: String, required: true },
});

export default mongoose.models.LoginSession || mongoose.model("LoginSession", LoginSessionSchema);
