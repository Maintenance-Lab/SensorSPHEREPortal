import mongoose, { Schema } from "mongoose";
const { ObjectId } = Schema.Types;

export interface AccountModel {
  _id?: string;
  enabled: boolean;
  isAdmin: boolean;
  name: string;
  email: string;
  password: string;
  meta: object; // Extra info if needed
  createdBy?: string | AccountModel;
  createdAt?: Date;
  hasChangedPassword?: boolean;
}

const AccountSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false },
  name: { type: String, default: "" },
  email: { type: String, default: "" },
  password: { type: String, default: "" },
  meta: { type: Object, default: {} },
  createdBy: { type: ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now },
  hasChangedPassword: { type: Boolean, default: false },
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
