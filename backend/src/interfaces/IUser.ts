import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "moderator" | "admin";
  avatar?: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}
