import mongoose, { Schema } from "mongoose";
import { ProjectModel } from "./Project";
const { ObjectId } = Schema.Types;

export interface SessionModel {
  _id: string;
  name: string;
  description: string;
  project: string | ProjectModel;
  meta: object; // Extra info if needed
  createdAt?: Date;
  sensorUnits?: string[];
  lastActive?: Date;
  archived?: boolean;
  status: "inactive" | "active" | "activeScheduled" | "paused" | "completed" | "error" | "scheduled" | "stopped";
}

const SessionSchema = new mongoose.Schema({
  name: { type: String, default: "Default Project Title" },
  description: { type: String, default: "Default Project Description" },
  project: { type: ObjectId, ref: "Project" },
  meta: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  sensorUnits: { type: [String], default: [] },
  lastActive: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["inactive", "active", "activeScheduled", "paused", "completed", "error", "scheduled", "stopped", ],
    default: "inactive"
  },
});

export default mongoose.models.Session || mongoose.model("Session", SessionSchema);
