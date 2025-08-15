/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/apiService";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import { Form, Input, Button, Checkbox, Alert, Typography, Card } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

// Định nghĩa schema validation cho form
const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  remember: z.boolean().optional(),
});
type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState("");

  // Lấy đường dẫn mà người dùng muốn vào trước khi bị chuyển hướng tới trang login
  const from = location.state?.from?.pathname || "/";

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // Hàm xử lý khi submit form
  const onFinish = async (data: LoginFormInputs) => {
    try {
      setServerError("");
      const response = await apiService.post("/auth/login", data);
      await login(response.data.accessToken);
      navigate(from, { replace: true });
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "Email hoặc mật khẩu không chính xác."
      );
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
          Đăng nhập FamilySite
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
          name="login"
          onFinish={handleSubmit(onFinish)}
          layout="vertical"
          size="large"
        >
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

          <Form.Item>
            <Controller
              name="remember"
              control={control}
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  Ghi nhớ tôi
                </Checkbox>
              )}
            />
            <a style={{ float: "right" }}>Quên mật khẩu?</a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              style={{ width: "100%" }}
            >
              Đăng nhập
            </Button>
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              Hoặc <Link to="/register">đăng ký ngay!</Link>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
