import { memo } from "react";
import { Handle, Position, type NodeProps } from "reactflow";
import { Avatar, Typography, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import './FamilyTreeNode.css';

const { Text } = Typography;

export interface FamilyTreeNodeData {
  name: string;
  avatar?: string;
  birthDate?: string;
  deathDate?: string;
  gender: "male" | "female";
}

const FamilyTreeNode = ({ data }: NodeProps<FamilyTreeNodeData>) => {
  const lifeRange = () => {
    if (!data.birthDate) return "Năm sinh không rõ";
    const birthYear = dayjs(data.birthDate).year();
    const deathYear = data.deathDate ? dayjs(data.deathDate).year() : "";
    return `${birthYear} - ${deathYear}`;
  };

  const genderClass = data.gender === "male" ? "male-node" : "female-node";

  return (
    <div className={`family-tree-node ${genderClass}`}>
      {/* Handle trên cho cha mẹ */}
      <Handle type="target" position={Position.Top} className="handle" />
      
      <Flex vertical align="center" gap={8}>
        <Avatar size={64} src={data.avatar} icon={<UserOutlined />} />
        <div>
          <Typography.Title
            level={5}
            style={{
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.name}
          </Typography.Title>
          <Text type="secondary" style={{ fontSize: '12px' }}>{lifeRange()}</Text>
        </div>
      </Flex>

      {/* Handle dưới cho con cái */}
      <Handle type="source" position={Position.Bottom} className="handle" />
      
      {/* === ĐÃ THÊM `id` VÀO HANDLE VỢ/CHỒNG === */}
      {/* Điểm kết nối bên phải (SOURCE) */}
      <Handle
        type="source"
        position={Position.Right}
        className="handle spouse-handle"
        id="spouse-right" // <-- ĐÃ THÊM
      />

      {/* Điểm kết nối bên trái (TARGET) */}
      <Handle
        type="target"
        position={Position.Left}
        className="handle spouse-handle"
        id="spouse-left" // <-- ĐÃ THÊM
      />
    </div>
  );
};

export default memo(FamilyTreeNode);