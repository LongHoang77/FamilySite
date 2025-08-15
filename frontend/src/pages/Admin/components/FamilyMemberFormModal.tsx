/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Spin,
  Empty,
  Divider,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  WomanOutlined,
  ManOutlined,
} from "@ant-design/icons";
import type { IFamilyMember } from "../../../interfaces";
import dayjs from "dayjs";
import apiService from "../../../services/apiService";
import { debounce } from "lodash";
import CreateNewMemberModal from "./CreateNewMemberModal";

// --- API Function for Searching (Không thay đổi) ---
const searchMembers = (
  name: string
): Promise<{ label: string; value: string }[]> => {
  if (!name.trim()) return Promise.resolve([]);
  return apiService
    .get(`/family-members/search?name=${name.trim()}`)
    .then((res) =>
      res.data.map((member: { _id: string; name: string }) => ({
        label: member.name,
        value: member._id,
      }))
    );
};

// --- DebounceSelect Component (Không thay đổi) ---
const DebounceSelect = ({
  value,
  onChange,
  fetchOptions,
  initialOptions = [],
  ...props
}: any) => {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const debounceFetcher = useMemo(
    () =>
      debounce((inputValue: string) => {
        setSearchValue(inputValue);
        if (!inputValue) {
          setOptions(initialOptions);
          return;
        }
        setFetching(true);
        fetchOptions(inputValue).then((newOptions: any[]) => {
          setOptions(newOptions);
          setFetching(false);
        });
      }, 500),
    [fetchOptions, initialOptions]
  );

  const handleCreateSuccess = (newMember: IFamilyMember) => {
    const newValue = [...(value || []), newMember._id];
    setOptions((prevOptions) => [
      ...prevOptions,
      { label: newMember.name, value: newMember._id },
    ]);
    onChange(newValue);
    setCreateModalOpen(false);
  };

  return (
    <>
      <Select
        labelInValue={false}
        filterOption={false}
        onSearch={debounceFetcher}
        notFoundContent={
          fetching ? (
            <Spin size="small" />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy"
            />
          )
        }
        value={value}
        onChange={onChange}
        options={options}
        {...props}
        dropdownRender={(menu) => (
          <>
            {menu}
            {searchValue && !fetching && (
              <>
                <Divider style={{ margin: "8px 0" }} />
                <Button
                  type="text"
                  icon={<PlusOutlined />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Tạo mới "{searchValue}"
                </Button>
              </>
            )}
          </>
        )}
      />
      <CreateNewMemberModal
        open={isCreateModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        initialName={searchValue}
      />
    </>
  );
};

// --- Type and Schema Definitions (Không thay đổi) ---
export const familyMemberSchema = z.object({
  name: z.string().min(1, "Tên không được để trống"),
  gender: z.enum(["male", "female"]),
  birthDate: z.any().optional(),
  deathDate: z.any().optional(),
  parents: z.array(z.string()).optional(),
  spouse: z.array(z.string()).optional(),
  children: z.array(z.string()).optional(),
});
export type FamilyMemberFormData = z.infer<typeof familyMemberSchema>;

interface FamilyMemberFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (data: FamilyMemberFormData) => void;
  isSubmitting: boolean;
  initialData?: IFamilyMember | null;
}

const FamilyMemberFormModal = ({
  open,
  onCancel,
  onSubmit,
  isSubmitting,
  initialData,
}: FamilyMemberFormModalProps) => {
  const isEditMode = !!initialData;
  const { control, handleSubmit, reset } = useForm<FamilyMemberFormData>({
    resolver: zodResolver(familyMemberSchema),
  });

  const [initialRelationOptions, setInitialRelationOptions] = useState<any[]>(
    []
  );
  const [isLoadingInitial, setIsLoadingInitial] = useState(false);

  useEffect(() => {
    const fetchAndSetInitialData = async () => {
      if (open) {
        if (isEditMode && initialData) {
          setIsLoadingInitial(true);
          const allIds = [
            ...(initialData.parents || []),
            ...(initialData.spouse || []),
            ...(initialData.children || []),
          ].filter(Boolean);

          let options: any[] = [];
          if (allIds.length > 0) {
            try {
              // ==================== THAY ĐỔI QUAN TRỌNG Ở ĐÂY ====================
              // Gọi API mới để chỉ lấy những thành viên cần thiết
              const membersByIds: IFamilyMember[] = await apiService
                .post("/family-members/by-ids", { ids: allIds })
                .then((res) => res.data);

              options = membersByIds.map((m) => ({
                label: m.name,
                value: m._id,
              }));
              // ====================================================================
            } catch (error) {
              console.error("Failed to fetch initial relations", error);
              // Đặt options thành mảng rỗng nếu có lỗi
              options = [];
            }
          }

          setInitialRelationOptions(options);
          reset({
            name: initialData.name,
            gender: initialData.gender,
            birthDate: initialData.birthDate
              ? dayjs(initialData.birthDate)
              : null,
            deathDate: initialData.deathDate
              ? dayjs(initialData.deathDate)
              : null,
            parents: initialData.parents || [],
            spouse: initialData.spouse || [],
            children: initialData.children || [],
          });
          setIsLoadingInitial(false);
        } else {
          // Chế độ tạo mới
          setInitialRelationOptions([]);
          reset({
            name: "",
            gender: "male",
            birthDate: null,
            deathDate: null,
            parents: [],
            spouse: [],
            children: [],
          });
        }
      }
    };
    fetchAndSetInitialData();
  }, [isEditMode, initialData, open, reset]);

  return (
    <Modal
      title={
        isEditMode ? `Chỉnh sửa: ${initialData?.name}` : "Thêm thành viên mới"
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={600}
    >
      {/* ... Phần JSX còn lại không thay đổi ... */}
      <Spin spinning={isLoadingInitial}>
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
                label="Họ và Tên"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
                required
              >
                <Input
                  {...field}
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Giới tính"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
                required
              >
                <Select {...field} placeholder="Chọn giới tính">
                  <Select.Option value="male">
                    <ManOutlined /> Nam
                  </Select.Option>
                  <Select.Option value="female">
                    <WomanOutlined /> Nữ
                  </Select.Option>
                </Select>
              </Form.Item>
            )}
          />
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <Form.Item label="Ngày sinh">
                <DatePicker
                  {...field}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="deathDate"
            control={control}
            render={({ field }) => (
              <Form.Item label="Ngày mất">
                <DatePicker
                  {...field}
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày mất (nếu có)"
                />
              </Form.Item>
            )}
          />

          <Controller
            name="parents"
            control={control}
            render={({ field }) => (
              <Form.Item label="Cha Mẹ">
                <DebounceSelect
                  mode="multiple"
                  placeholder="Gõ để tìm kiếm và thêm cha mẹ..."
                  fetchOptions={searchMembers}
                  initialOptions={initialRelationOptions.filter((opt) =>
                    initialData?.parents?.includes(opt.value)
                  )}
                  {...field}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="spouse"
            control={control}
            render={({ field }) => (
              <Form.Item label="Vợ/Chồng">
                <DebounceSelect
                  mode="multiple"
                  placeholder="Gõ để tìm kiếm và thêm vợ/chồng..."
                  fetchOptions={searchMembers}
                  initialOptions={initialRelationOptions.filter((opt) =>
                    initialData?.spouse?.includes(opt.value)
                  )}
                  {...field}
                />
              </Form.Item>
            )}
          />
          <Controller
            name="children"
            control={control}
            render={({ field }) => (
              <Form.Item label="Con Cái">
                <DebounceSelect
                  mode="multiple"
                  placeholder="Gõ để tìm kiếm và thêm con cái..."
                  fetchOptions={searchMembers}
                  initialOptions={initialRelationOptions.filter((opt) =>
                    initialData?.children?.includes(opt.value)
                  )}
                  {...field}
                />
              </Form.Item>
            )}
          />

          <Form.Item
            style={{ textAlign: "right", marginBottom: 0, marginTop: 24 }}
          >
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
      </Spin>
    </Modal>
  );
};

export default FamilyMemberFormModal;
