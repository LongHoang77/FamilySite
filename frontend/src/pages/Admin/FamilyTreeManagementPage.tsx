/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/apiService";
import type { IFamilyMember } from "../../interfaces";
import {
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Typography,
  Tag,
  Drawer,
  List,
  Avatar,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ManOutlined,
  WomanOutlined,
  EyeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import FamilyMemberFormModal, {
  type FamilyMemberFormData,
} from "./components/FamilyMemberFormModal";
import dayjs from "dayjs";

// --- API Functions (không đổi) ---
const fetchFamilyMembers = (): Promise<IFamilyMember[]> =>
  apiService.get("/family-members").then((res) => res.data);
const createFamilyMember = (
  memberData: FamilyMemberFormData
): Promise<IFamilyMember> =>
  apiService.post("/family-members", memberData).then((res) => res.data);
const updateFamilyMember = ({
  id,
  ...memberData
}: FamilyMemberFormData & { id: string }): Promise<IFamilyMember> =>
  apiService.put(`/family-members/${id}`, memberData).then((res) => res.data);
const deleteFamilyMember = (memberId: string): Promise<any> =>
  apiService.delete(`/family-members/${memberId}`);

const FamilyTreeManagementPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<IFamilyMember | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewingMember, setViewingMember] = useState<IFamilyMember | null>(
    null
  );

  const { data: rawMembers, isLoading } = useQuery<IFamilyMember[]>({
    queryKey: ["familyMembersAdmin"],
    queryFn: fetchFamilyMembers,
  });

  // Dữ liệu `cleanMembers` là một danh sách phẳng, nhưng VẪN GIỮ NGUYÊN thuộc tính `children`
  const { cleanMembers, membersIdMap } = useMemo(() => {
    if (!rawMembers) {
      return { cleanMembers: [], membersIdMap: new Map() };
    }
    const filteredMembers = rawMembers.filter(
      (member) => member && member.name
    );
    const idMap = new Map<string, IFamilyMember>(
      filteredMembers.map((m) => [m._id, m])
    );
    return { cleanMembers: filteredMembers, membersIdMap: idMap };
  }, [rawMembers]);

  // Các hook mutation và handlers không thay đổi
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: createFamilyMember,
    onSuccess: () => {
      message.success("Thêm thành viên thành công!");
      queryClient.invalidateQueries({ queryKey: ["familyMembersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      setIsModalOpen(false);
    },
    onError: (error: any) =>
      message.error(
        error.response?.data?.message || "Không thể thêm thành viên."
      ),
  });
  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateFamilyMember,
    onSuccess: () => {
      message.success("Cập nhật thành công!");
      queryClient.invalidateQueries({ queryKey: ["familyMembersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
      closeModal();
    },
    onError: (error: any) =>
      message.error(error.response?.data?.message || "Không thể cập nhật."),
  });
  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteFamilyMember,
    onSuccess: () => {
      message.success("Xóa thành viên thành công!");
      queryClient.invalidateQueries({ queryKey: ["familyMembersAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["familyMembers"] });
    },
    onError: (error: any) =>
      message.error(error.response?.data?.message || "Không thể xóa."),
  });
  const showCreateModal = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };
  const showEditModal = (member: IFamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };
  const handleFormSubmit = (data: FamilyMemberFormData) => {
    if (editingMember) {
      updateMutate({ id: editingMember._id, ...data });
    } else {
      createMutate(data);
    }
  };
  const showDrawer = (member: IFamilyMember) => {
    setViewingMember(member);
    setIsDrawerOpen(true);
  };
  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setViewingMember(null);
  };

  const columns: ColumnsType<IFamilyMember> = [
    {
      title: "Họ và Tên",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 200,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      render: (gender: string) =>
        gender === "male" ? (
          <Tag icon={<ManOutlined />} color="blue">
            Nam
          </Tag>
        ) : (
          <Tag icon={<WomanOutlined />} color="magenta">
            Nữ
          </Tag>
        ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      key: "birthDate",
      width: 150,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
    },
    {
      title: "Cha Mẹ",
      dataIndex: "parents",
      key: "parents",
      width: 250,
      render: (parentIds: string[] | undefined) => {
        if (!parentIds || parentIds.length === 0)
          return <Typography.Text type="secondary">Không rõ</Typography.Text>;
        const names = parentIds
          .map((id) => membersIdMap.get(id)?.name)
          .filter(Boolean);
        return (
          <Space size={[0, 8]} wrap>
            {names.map((name, i) => (
              <Tag key={i} color="green">
                {name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Vợ/Chồng",
      dataIndex: "spouse",
      key: "spouse",
      width: 250,
      render: (spouseIds: string[] | undefined) => {
        if (!spouseIds || spouseIds.length === 0)
          return <Typography.Text type="secondary">Không rõ</Typography.Text>;
        const names = spouseIds
          .map((id) => membersIdMap.get(id)?.name)
          .filter(Boolean);
        return (
          <Space size={[0, 8]} wrap>
            {names.map((name, i) => (
              <Tag key={i} color="volcano">
                {name}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => showDrawer(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title={`Xóa ${record.name}`}
            description="Hành động này không thể hoàn tác. Bạn chắc chứ?"
            onConfirm={() => deleteMutate(record._id)}
            okText="Xóa"
            okButtonProps={{ loading: isDeleting }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const renderRelationsList = (
    relationType: "parents" | "spouse" | "children"
  ) => {
    if (!viewingMember) return null;
    const relationIds = viewingMember[relationType] || [];
    const relationData = relationIds
      .map((id) => membersIdMap.get(id))
      .filter(Boolean) as IFamilyMember[];
    const titleMap = {
      parents: "Cha Mẹ",
      spouse: "Vợ/Chồng",
      children: "Con Cái",
    };
    if (relationData.length === 0)
      return (
        <>
          <Typography.Title level={5} style={{ marginTop: 24 }}>
            {titleMap[relationType]}
          </Typography.Title>
          <Typography.Text type="secondary">
            Không có thông tin.
          </Typography.Text>
        </>
      );
    return (
      <>
        <Typography.Title level={5} style={{ marginTop: 24 }}>
          {titleMap[relationType]}
        </Typography.Title>
        <List
          itemLayout="horizontal"
          dataSource={relationData}
          renderItem={(person) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src={person.avatar} icon={<UserOutlined />} />}
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
      </>
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Quản lý Gia phả
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Thêm thành viên
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={cleanMembers}
        loading={isLoading}
        rowKey="_id"
        scroll={{ x: 1100 }}
        expandable={{
          expandedRowRender: () => false,
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
      />
      <FamilyMemberFormModal
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingMember}
      />
      <Drawer
        title={
          <Typography.Title level={4}>{viewingMember?.name}</Typography.Title>
        }
        placement="right"
        onClose={closeDrawer}
        open={isDrawerOpen}
        width={400}
      >
        {viewingMember && (
          <div>
            {renderRelationsList("parents")}
            {renderRelationsList("spouse")}
            {renderRelationsList("children")}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default FamilyTreeManagementPage;
