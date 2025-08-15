import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import FamilyMember from "../models/FamilyMember";
// Giả sử bạn có interface này, nếu không thì có thể bỏ qua
// import { IFamilyMember } from "../interfaces/IFamilyMember";

// --- Helpers (Không thay đổi) ---
const syncRelationships = async (
  memberId: string,
  relationships: { parents?: string[]; children?: string[]; spouse?: string[] }
) => {
  const { parents = [], children = [], spouse = [] } = relationships;
  if (parents.length > 0)
    await FamilyMember.updateMany(
      { _id: { $in: parents } },
      { $addToSet: { children: memberId } }
    );
  if (children.length > 0)
    await FamilyMember.updateMany(
      { _id: { $in: children } },
      { $addToSet: { parents: memberId } }
    );
  if (spouse.length > 0)
    await FamilyMember.updateMany(
      { _id: { $in: spouse } },
      { $addToSet: { spouse: memberId } }
    );
};

const removeOldRelationships = async (memberId: string) => {
  const memberObjectId = new mongoose.Types.ObjectId(memberId);
  await FamilyMember.updateMany(
    {},
    {
      $pull: {
        children: memberObjectId,
        parents: memberObjectId,
        spouse: memberObjectId,
      },
    }
  );
};

// --- Controllers ---

export const getFamilyMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const members = await FamilyMember.find({});
    // Chuyển đổi sang POJO để nhất quán và an toàn về kiểu
    const memberObjects = members.map((m) => m.toJSON());
    res.json(memberObjects);
  } catch (error) {
    next(error);
  }
};

export const createFamilyMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      gender,
      birthDate,
      deathDate,
      avatar,
      parents,
      children,
      spouse,
    } = req.body;

    const member = await FamilyMember.create({
      name,
      gender,
      birthDate,
      deathDate,
      avatar,
      parents,
      children,
      spouse,
    });

    const memberObject = member.toJSON();
    await syncRelationships(memberObject._id.toString(), {
      parents,
      children,
      spouse,
    });

    res.status(201).json(memberObject);
  } catch (error) {
    next(error);
  }
};

export const updateFamilyMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = await FamilyMember.findById(req.params.id);

    if (member) {
      await removeOldRelationships(req.params.id);

      const {
        name,
        gender,
        birthDate,
        deathDate,
        avatar,
        parents,
        children,
        spouse,
      } = req.body;

      member.name = name ?? member.name;
      member.gender = gender ?? member.gender;
      member.birthDate = birthDate;
      member.deathDate = deathDate;
      member.avatar = avatar ?? member.avatar;
      member.parents = parents ?? [];
      member.children = children ?? [];
      member.spouse = spouse ?? [];

      const updatedMember = await member.save();
      const updatedMemberObject = updatedMember.toJSON();

      await syncRelationships(updatedMemberObject._id.toString(), {
        parents: updatedMemberObject.parents?.map((id) => id.toString()),
        children: updatedMemberObject.children?.map((id) => id.toString()),
        spouse: updatedMemberObject.spouse?.map((id) => id.toString()),
      });

      res.json(updatedMemberObject);
    } else {
      res.status(404).json({ message: "Family member not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteFamilyMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const member = await FamilyMember.findById(req.params.id);
    if (member) {
      await removeOldRelationships(req.params.id);
      await member.deleteOne();
      res.json({
        message: "Family member removed and relationships cleaned up",
      });
    } else {
      res.status(404).json({ message: "Family member not found" });
    }
  } catch (error) {
    next(error);
  }
};

export const searchFamilyMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const keyword = req.query.name
      ? { name: { $regex: req.query.name, $options: "i" } }
      : {};
    const members = await FamilyMember.find({ ...keyword })
      .select("_id name") // Chỉ chọn _id và name cho nhẹ
      .limit(10); // Giới hạn 10 kết quả

    const memberObjects = members.map((m) => m.toJSON());
    res.json(memberObjects);
  } catch (error) {
    next(error);
  }
};

// ===================== HÀM MỚI ĐƯỢC THÊM VÀO =====================
/**
 * @desc    Lấy thông tin của nhiều thành viên dựa trên một mảng ID
 * @route   POST /api/family-members/by-ids
 * @access  Private
 */
export const getMembersByIds = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ids } = req.body;

    // Validation: Đảm bảo ids là một mảng và không rỗng
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.json([]); // Nếu không có id nào, trả về mảng rỗng
    }

    // Sử dụng toán tử $in của MongoDB để tìm tất cả các document có _id trong mảng ids
    const members = await FamilyMember.find({ _id: { $in: ids } });

    // Luôn chuyển đổi kết quả sang POJO trước khi gửi về client
    const memberObjects = members.map((member) => member.toJSON());

    res.json(memberObjects);
  } catch (error) {
    next(error);
  }
};
// =================================================================
