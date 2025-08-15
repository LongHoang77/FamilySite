// src/models/NavigationItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INavigationItem extends Document {
  name: string;
  path: string;
  icon?: string;
  position: "navbar" | "sidebar";
  roles: ("user" | "moderator" | "admin")[];
  order: number;
}

const navigationItemSchema: Schema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true }, // Dùng key thay cho path để định danh duy nhất
  path: { type: String }, // Path có thể không có cho menu cha
  icon: { type: String },
  position: { type: String, enum: ["navbar", "sidebar"], required: true },
  roles: [
    { type: String, enum: ["user", "moderator", "admin"], required: true },
  ],
  order: { type: Number, default: 0 },
  parent: { type: String, ref: "NavigationItem", default: null }, // Liên kết với key của mục cha
});

export default mongoose.model<INavigationItem>(
  "NavigationItem",
  navigationItemSchema
);
