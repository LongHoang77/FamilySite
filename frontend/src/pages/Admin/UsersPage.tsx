/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../services/apiService";
import type { IUser } from "../../interfaces";
import {
  Table,
  Space,
  Button,
  Popconfirm,
  message,
  Tag,
  Avatar,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PlusOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
// CẬP NHẬT 1: Import kiểu dữ liệu duy nhất 'UserFormData'
import UserFormModal, { type UserFormData } from "./components/UserFormModal"; 

// --- Định nghĩa các hàm gọi API ---
const fetchUsers = (): Promise<IUser[]> =>
  apiService.get("/users").then((res) => res.data);

// CẬP NHẬT 2: Hàm createUser giờ nhận kiểu 'UserFormData'
const createUser = (userData: UserFormData): Promise<IUser> =>
  apiService.post("/users", userData).then((res) => res.data);

// CẬP NHẬT 3: Hàm updateUser nhận 'UserFormData' và loại bỏ password
const updateUser = ({
  id,
  ...userData
}: UserFormData & { id: string }): Promise<IUser> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updateData } = userData; // Loại bỏ trường password (nếu có)
    return apiService.put(`/users/${id}`, updateData).then((res) => res.data);
};

const deleteUser = (userId: string): Promise<any> =>
  apiService.delete(`/users/${userId}`);

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

  // --- React Query Hooks ---
  const { data: users, isLoading: isUsersLoading } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { mutate: createUserMutate, isPending: isCreating } = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success("Tạo người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
    },
    onError: (error: any) =>
      message.error(
        error.response?.data?.message || "Không thể tạo người dùng."
      ),
  });

  const { mutate: updateUserMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      message.success("Cập nhật người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (error: any) =>
      message.error(
        error.response?.data?.message || "Không thể cập nhật người dùng."
      ),
  });

  const { mutate: deleteUserMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success("Xóa người dùng thành công!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) =>
      message.error(
        error.response?.data?.message || "Không thể xóa người dùng."
      ),
  });

  // --- Handlers ---
  const showCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const showEditModal = (user: IUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  // CẬP NHẬT 4: Hàm handleFormSubmit giờ nhận kiểu 'UserFormData'
  const handleFormSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUserMutate({ id: editingUser._id, ...data });
    } else {
      createUserMutate(data);
    }
  };

  // --- Table Columns Definition ---
  const columns: ColumnsType<IUser> = [
    {
      title: "Người dùng",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <span>{name}</span>
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag
          color={
            role === "admin"
              ? "volcano"
              : role === "moderator"
              ? "green"
              : "geekblue"
          }
        >
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          />
          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa ${record.name}?`}
            onConfirm={() => deleteUserMutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ loading: isDeleting }}
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

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
          Danh sách người dùng
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Thêm mới
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        loading={isUsersLoading}
        rowKey="_id"
        scroll={{ x: "max-content" }}
      />
      <UserFormModal
        open={isModalOpen}
        onCancel={closeModal}
        onSubmit={handleFormSubmit}
        isSubmitting={isCreating || isUpdating}
        initialData={editingUser}
      />
    </div>
  );
};

export default UsersPage;