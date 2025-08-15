// Định nghĩa cấu trúc của đối tượng User
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "moderator" | "admin";
  avatar?: string;
}

// Định nghĩa cấu trúc của một mục menu
export interface INavigationItem {
  _id: string;
  name: string;
  key: string; // Định danh duy nhất
  path?: string; // Đường dẫn URL, optional cho menu cha
  icon?: string;
  position: "navbar" | "sidebar";
  roles: ("user" | "moderator" | "admin")[];
  order: number;
  parent?: string | null;
}

// Định nghĩa cấu trúc của một thành viên trong gia phả
export interface IFamilyMember {
  _id: string;
  name: string;
  gender: "male" | "female";
  birthDate?: string;
  deathDate?: string;
  avatar?: string;
  spouse?: string[];
  parents?: string[];
  children?: string[];
}
