import { Router } from "express";
import { getNavigationItems } from "../controllers/navigationController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Áp dụng 'protect' để đảm bảo chỉ người dùng đã đăng nhập mới thấy menu
router.get("/", protect, getNavigationItems);

export default router;
