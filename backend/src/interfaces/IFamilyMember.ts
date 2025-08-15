import { Document, Types } from "mongoose";

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
