import { Document } from "mongoose";

export interface INavigationItem extends Document {
  name: string;
  path: string;
  icon?: string;
  position: "navbar" | "sidebar";
  roles: ("user" | "moderator" | "admin")[];
  order: number;
}
