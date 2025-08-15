import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, Form, Input, Select, Button } from "antd";
import { MailOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import type { IUser } from "../../../interfaces";

// --- Type Definitions ---
// Chúng ta sẽ định nghĩa một kiểu dữ liệu cho form, bao gồm cả password
// vì form CÓ thể có trường password.
export type UserFormData = {
  name: string;
  email: string;
  role: "user" | "moderator" | "admin";
  password?: string; // Password là optional
};

// --- Component Props ---
interface UserFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: UserFormData) => void;
  isSubmitting: boolean;
  initialData?: IUser | null;
}

const UserFormModal = ({
  open,
  onCancel,
  onSubmit,
  isSubmitting,
  initialData,
}: UserFormModalProps) => {
  const isEditMode = !!initialData;

  // --- Schema Validation (Logic chính ở đây) ---
  // Sử dụng z.discriminatedUnion hoặc logic điều kiện để tạo schema động
  const userSchema = z
    .object({
      name: z.string().min(1, "Tên không được để trống"),
      email: z.string().email("Email không hợp lệ"),
      role: z.enum(["user", "moderator", "admin"]),
      // Password chỉ là bắt buộc khi không ở chế độ chỉnh sửa
      password: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isEditMode && (!data.password || data.password.length < 6)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["password"],
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }
    });

  const { control, handleSubmit, reset } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    // Giá trị mặc định giờ đây hoàn toàn khớp với kiểu UserFormData
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      password: "",
    },
  });

  // Reset form khi modal mở hoặc dữ liệu thay đổi
  useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        // Điền dữ liệu, password để trống
        reset({
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          password: "",
        });
      } else {
        // Reset hoàn toàn cho form tạo mới
        reset({
          name: "",
          email: "",
          role: "user",
          password: "",
        });
      }
    }
  }, [isEditMode, initialData, open, reset]);

  return (
    <Modal
      title={
        isEditMode ? `Chỉnh sửa: ${initialData?.name}` : "Thêm người dùng mới"
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        layout="vertical"
        onFinish={handleSubmit(onSubmit)}
        style={{ marginTop: "24px" }}
      >
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Tên người dùng"
              validateStatus={fieldState.error ? "error" : ""}
              help={fieldState.error?.message}
              required
            >
              <Input
                {...field}
                prefix={<UserOutlined />}
                placeholder="Nhập tên"
              />
            </Form.Item>
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Email"
              validateStatus={fieldState.error ? "error" : ""}
              help={fieldState.error?.message}
              required
            >
              <Input
                {...field}
                prefix={<MailOutlined />}
                placeholder="Nhập email"
                type="email"
                disabled={isEditMode}
              />
            </Form.Item>
          )}
        />

        {!isEditMode && (
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Mật khẩu"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
                required
              >
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                />
              </Form.Item>
            )}
          />
        )}

        <Controller
          name="role"
          control={control}
          render={({ field, fieldState }) => (
            <Form.Item
              label="Vai trò"
              validateStatus={fieldState.error ? "error" : ""}
              help={fieldState.error?.message}
              required
            >
              <Select {...field} placeholder="Chọn vai trò">
                <Select.Option value="user">User</Select.Option>
                <Select.Option value="moderator">Moderator</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>
          )}
        />

        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Button
            onClick={onCancel}
            style={{ marginRight: 8 }}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserFormModal;
