import mongoose, { Schema } from "mongoose";
import { ProjectModel } from "./Project";
const { ObjectId } = Schema.Types;


export interface AccountModel {
  _id: string;
  enabled: boolean;
  name: string;
  email: string;
  password: string;
  meta: object; // Extra info if needed
  createdBy?: string | AccountModel;
  createdAt?: Date;
  hasChangedPassword?: boolean;
  role: "administrator" | "student" | "teacher" | "staff";
  hasAvatar: boolean;
  pinnedProjects?: string[] | ProjectModel[];
}

const AccountSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  name: { type: String, default: "", unique: true },
  email: { type: String, default: "", unique: true },
  password: { type: String, default: "" },
  meta: { type: Object, default: {} },
  createdBy: { type: ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now },
  hasChangedPassword: { type: Boolean, default: false },
  role: { type: String, enum: ["administrator", "student", "teacher", "staff"], default: "student" },
  hasAvatar: { type: Boolean, default: false },
  pinnedProjects: [{ type: ObjectId, ref: "Project" }],
});

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
