import { Router } from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  createUser,
} from "../controllers/userController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

// Áp dụng middleware cho tất cả các route
router.use(protect, authorize("admin"));

router.route("/").get(getUsers).post(createUser);

router.route("/:id").put(updateUser).delete(deleteUser);

export default router;
