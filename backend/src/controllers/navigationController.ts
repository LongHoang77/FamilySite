import { Request, Response } from "express";
import NavigationItem from "../models/NavigationItem";

export const getNavigationItems = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role || "guest"; // Nếu chưa đăng nhập thì là guest
    const { position } = req.query;

    const query: any = {
      roles: { $in: [userRole] },
    };

    if (position) {
      query.position = position;
    }

    const items = await NavigationItem.find(query).sort({ order: 1 });
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
