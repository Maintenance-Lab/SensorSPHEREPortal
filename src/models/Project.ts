import mongoose, { Schema } from "mongoose";
import { AccountModel } from "./Account";
const { ObjectId } = Schema.Types;

export interface ProjectModel {
  _id?: string;
  name: string;
  description: string;
  meta: object; // Extra info if needed
  createdBy?: string | AccountModel;
  createdAt?: Date;
  sensorUnits?: string[];
  lastActive?: Date;
}

const ProjectSchema = new mongoose.Schema({
  name: { type: String, default: "Default Project Title" },
  description: { type: String, default: "Default Project Description" },
  meta: { type: Object, default: {} },
  createdBy: { type: ObjectId, ref: "Account" },
  createdAt: { type: Date, default: Date.now },
  sensorUnits: { type: [String], default: [] },
  lastActive: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
