import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getMe,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);

export default router;
