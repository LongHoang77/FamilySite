import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import type { IUser } from "../../interfaces";
import { Spin } from "antd";

interface ProtectedRouteProps {
  allowedRoles: IUser["role"][];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Nếu đang trong quá trình kiểm tra xác thực, hiển thị spinner
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Nếu chưa đăng nhập, chuyển hướng đến trang login
  // Lưu lại trang hiện tại để có thể quay lại sau khi đăng nhập thành công
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập nhưng vai trò không được phép, chuyển hướng đến trang "Unauthorized"
  return user && allowedRoles.includes(user.role) ? (
    <Outlet /> // Render trang con nếu có quyền
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default ProtectedRoute;
