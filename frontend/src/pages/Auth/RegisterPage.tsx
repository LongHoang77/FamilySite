/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import apiService from "../../services/apiService";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Form, Input, Button, Alert, Typography, Card, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";

// Thêm validation cho password và confirm password
const registerSchema = z
  .object({
    name: z.string().min(1, "Tên không được để trống"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"], // Gắn lỗi vào trường confirmPassword
  });

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onFinish = async (data: RegisterFormInputs) => {
    try {
      setServerError("");
      await apiService.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      message.success("Đăng ký tài khoản thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Đã có lỗi xảy ra.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 128px)",
      }}
    >
      <Card style={{ width: 400 }}>
        <Typography.Title
          level={2}
          style={{ textAlign: "center", marginBottom: "2rem" }}
        >
          Tạo tài khoản
        </Typography.Title>
        {serverError && (
          <Alert
            message={serverError}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            closable
          />
        )}
        <Form
          name="register"
          onFinish={handleSubmit(onFinish)}
          layout="vertical"
          size="large"
        >
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Tên của bạn"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
              >
                <Input {...field} prefix={<UserOutlined />} placeholder="Tên" />
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
              >
                <Input
                  {...field}
                  prefix={<MailOutlined />}
                  placeholder="Email"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Mật khẩu"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
              >
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Mật khẩu"
                />
              </Form.Item>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <Form.Item
                label="Xác nhận mật khẩu"
                validateStatus={fieldState.error ? "error" : ""}
                help={fieldState.error?.message}
              >
                <Input.Password
                  {...field}
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                />
              </Form.Item>
            )}
          />
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ width: "100%" }}
            >
              Đăng ký
            </Button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
