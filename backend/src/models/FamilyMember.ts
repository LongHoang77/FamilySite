// src/models/FamilyMember.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFamilyMember extends Document {
  name: string;
  gender: "male" | "female";
  birthDate?: Date;
  deathDate?: Date;
  avatar?: string;
  spouse?: Types.ObjectId[];
  parents?: Types.ObjectId[];
  children?: Types.ObjectId[];
}

const familyMemberSchema: Schema = new Schema({
  name: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  birthDate: { type: Date },
  deathDate: { type: Date },
  avatar: { type: String },
  spouse: [{ type: Schema.Types.ObjectId, ref: "FamilyMember" }],
  parents: [{ type: Schema.Types.ObjectId, ref: "FamilyMember" }],
  children: [{ type: Schema.Types.ObjectId, ref: "FamilyMember" }],
});

export default mongoose.model<IFamilyMember>(
  "FamilyMember",
  familyMemberSchema
);
