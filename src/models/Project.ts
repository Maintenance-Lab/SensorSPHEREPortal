import mongoose, { Schema } from "mongoose";
import { AccountModel } from "./Account";
const { ObjectId } = Schema.Types;

export interface ProjectModel {
  _id?: string;
  name: string;
  description: string;
  meta: object; // Extra info if needed
  owner?: string | AccountModel;
  createdAt?: Date;
  sensorUnits?: string[];
  lastActive?: Date;
  archived?: boolean;
  collaborators?: string[] | AccountModel[]; // Array of Account IDs
}

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: "Default Project Title" },
  description: { type: String, default: "Default Project Description" },
  meta: { type: Object, default: {} },
  owner: { type: ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now },
  sensorUnits: { type: [String], default: [] },
  lastActive: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  collaborators: [{ type: ObjectId, ref: "Account" }],
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
