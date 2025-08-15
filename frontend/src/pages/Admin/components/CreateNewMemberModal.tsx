import { Modal, Form, Input, Select, Button, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../../../services/apiService";
import type { IFamilyMember } from "../../../interfaces";
import { useEffect } from "react";

// API function để tạo thành viên với thông tin tối thiểu
const createBareboneMember = async (data: {
  name: string;
  gender: "male" | "female";
}): Promise<IFamilyMember> => {
  const res = await apiService.post("/family-members", data);
  return res.data;
};

interface CreateNewMemberModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: (newMember: IFamilyMember) => void;
  initialName: string;
}

const CreateNewMemberModal = ({
  open,
  onCancel,
  onSuccess,
  initialName,
}: CreateNewMemberModalProps) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createBareboneMember,
    onSuccess: (newMember) => {
      message.success(`Đã tạo "${newMember.name}"!`);
      // Invalidate query để các lần tìm kiếm sau sẽ có người mới này
      queryClient.invalidateQueries({
        queryKey: ["allFamilyMembersForSelect"],
      });
      onSuccess(newMember); // Trả về thông tin người mới cho component cha
      form.resetFields();
    },
    onError: () => message.error("Tạo mới thất bại!"),
  });

  const handleFinish = (values: {
    name: string;
    gender: "male" | "female";
  }) => {
    mutate(values);
  };

  // Set lại tên ban đầu khi modal mở
  useEffect(() => {
    if (open) {
      form.setFieldsValue({ name: initialName, gender: "male" });
    }
  }, [open, initialName, form]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={`Tạo thành viên mới`}
      footer={null}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
        >
          <Select>
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Tạo
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateNewMemberModal;
