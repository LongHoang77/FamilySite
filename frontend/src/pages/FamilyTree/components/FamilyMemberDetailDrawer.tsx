import { Drawer, Descriptions, Typography, List, Avatar } from "antd";
import type { IFamilyMember } from "../../../interfaces";
import dayjs from "dayjs";
import { UserOutlined } from "@ant-design/icons";

interface FamilyMemberDetailDrawerProps {
  member: IFamilyMember | null;
  allMembers: IFamilyMember[]; // Cần danh sách tất cả thành viên để tra cứu tên theo ID
  onClose: () => void;
}

const FamilyMemberDetailDrawer = ({
  member,
  allMembers,
  onClose,
}: FamilyMemberDetailDrawerProps) => {
  if (!member) return null;

  // Hàm tiện ích để tìm thông tin thành viên từ ID
  const findMemberById = (id: string) => {
    return allMembers.find((m) => m._id === id);
  };

  return (
    <Drawer
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          {member.name}
        </Typography.Title>
      }
      placement="right"
      onClose={onClose}
      open={!!member}
      width={400}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Họ và Tên">{member.name}</Descriptions.Item>
        <Descriptions.Item label="Giới tính">
          {member.gender === "male" ? "Nam" : "Nữ"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày sinh">
          {member.birthDate
            ? dayjs(member.birthDate).format("DD/MM/YYYY")
            : "Không rõ"}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày mất">
          {member.deathDate
            ? dayjs(member.deathDate).format("DD/MM/YYYY")
            : "Còn sống"}
        </Descriptions.Item>
      </Descriptions>

      {/* Hiển thị danh sách các mối quan hệ */}
      {(["parents", "spouse", "children"] as const).map((relationType) => {
        const relationIds = member[relationType];
        if (!relationIds || relationIds.length === 0) return null;

        const relationData = relationIds
          .map(findMemberById)
          .filter(Boolean) as IFamilyMember[];

        const titleMap = {
          parents: "Cha Mẹ",
          spouse: "Vợ/Chồng",
          children: "Con Cái",
        };

        return (
          <div key={relationType}>
            <Typography.Title level={5} style={{ marginTop: 24 }}>
              {titleMap[relationType]}
            </Typography.Title>
            <List
              itemLayout="horizontal"
              dataSource={relationData}
              renderItem={(person) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar src={person.avatar} icon={<UserOutlined />} />
                    }
                    title={person.name}
                    description={
                      person.birthDate
                        ? `Sinh năm ${dayjs(person.birthDate).year()}`
                        : ""
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        );
      })}
    </Drawer>
  );
};

export default FamilyMemberDetailDrawer;
