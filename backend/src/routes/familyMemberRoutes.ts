import { Router } from "express";
import {
  getFamilyMembers,
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  searchFamilyMembers, // <--- THÊM MỚI: Import hàm tìm kiếm
  getMembersByIds, // <--- THÊM MỚI: Import hàm lấy theo IDs
} from "../controllers/familyMemberController";
import { protect, authorize } from "../middleware/authMiddleware";

const router = Router();

// Các route hiện có, chỉ cần đảm bảo có `protect`
router
  .route("/")
  .get(protect, getFamilyMembers)
  .post(protect, authorize("moderator", "admin"), createFamilyMember);

// --- CÁC ROUTE MỚI ĐƯỢC THÊM VÀO ĐÂY ---

// Route để tìm kiếm thành viên theo tên (dành cho DebounceSelect)
router.get("/search", protect, searchFamilyMembers);

// Route để lấy thông tin nhiều thành viên bằng một mảng ID
router.post("/by-ids", protect, getMembersByIds);

// --- CÁC ROUTE CÓ PARAMETER :id NÊN ĐỂ Ở CUỐI ---

router
  .route("/:id")
  .put(protect, authorize("moderator", "admin"), updateFamilyMember)
  .delete(protect, authorize("moderator", "admin"), deleteFamilyMember);

export default router;
