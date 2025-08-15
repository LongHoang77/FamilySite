import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db";
import User from "./models/User";
import NavigationItem from "./models/NavigationItem";
import FamilyMember from "./models/FamilyMember";

dotenv.config();
connectDB();

const users = [
  // Admin sẽ được tạo khi đăng ký lần đầu, không cần seed
];

const navItems = [
  // --- Navbar Items ---
  {
    name: "Trang chủ",
    key: "home",
    path: "/",
    position: "navbar",
    roles: ["user", "moderator", "admin"],
    order: 1,
  },
  {
    name: "Gia phả",
    key: "family-tree",
    path: "/family-tree",
    position: "navbar",
    roles: ["user", "moderator", "admin"],
    order: 2,
  },

  // --- Sidebar Items (với cấu trúc cha-con) ---
  {
    name: "Dashboard",
    key: "dashboard",
    path: "/admin/dashboard",
    position: "sidebar",
    roles: ["admin", "moderator"],
    order: 1,
    icon: "DashboardOutlined",
  },

  // Mục cha
  {
    name: "Quản lý",
    key: "management",
    position: "sidebar",
    roles: ["admin", "moderator"],
    order: 2,
    icon: "AppstoreOutlined",
    parent: null,
  },

  // Các mục con
  {
    name: "Người dùng",
    key: "/admin/users",
    path: "/admin/users",
    position: "sidebar",
    roles: ["admin"],
    order: 3,
    icon: "UserOutlined",
    parent: "management",
  },
  {
    name: "Gia phả",
    key: "/admin/family-tree-management",
    path: "/admin/family-tree-management",
    position: "sidebar",
    roles: ["admin", "moderator"],
    order: 4,
    icon: "TeamOutlined",
    parent: "management",
  },

  {
    name: "Cài đặt",
    key: "settings",
    path: "/admin/settings",
    position: "sidebar",
    roles: ["admin"],
    order: 5,
    icon: "SettingOutlined",
  },
];

const importData = async () => {
  try {
    await User.deleteMany();
    await NavigationItem.deleteMany();

    await NavigationItem.insertMany(navItems);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await NavigationItem.deleteMany();

    console.log("Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
