import { Layout } from "antd";
import { Routes, Route, useLocation } from "react-router-dom";

// Import các thành phần Layout và Điều hướng
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

// Import tất cả các Pages đã tạo
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import FamilyTreePage from "./pages/FamilyTree/FamilyTreePage";
import DashboardPage from "./pages/Admin/DashboardPage";
import UsersPage from "./pages/Admin/UsersPage";
import FamilyTreeManagementPage from "./pages/Admin/FamilyTreeManagementPage";

const { Content } = Layout;

function App() {
  const location = useLocation();
  // Kiểm tra xem URL hiện tại có thuộc khu vực admin hay không
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    // Component Layout của AntD bọc toàn bộ ứng dụng
    <Layout style={{ minHeight: "100vh" }}>
      {/* Navbar chỉ hiển thị ở các trang không phải là trang admin */}
      {!isAdminRoute && <Navbar />}

      {/* Hệ thống định tuyến của ứng dụng */}
      <Routes>
        {/* --- Nhóm 1: Các Route công khai và chung --- */}
        <Route
          path="/"
          element={
            <PublicContentLayout>
              <HomePage />
            </PublicContentLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicContentLayout>
              <LoginPage />
            </PublicContentLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PublicContentLayout>
              <RegisterPage />
            </PublicContentLayout>
          }
        />
        <Route
          path="/unauthorized"
          element={
            <PublicContentLayout>
              <UnauthorizedPage />
            </PublicContentLayout>
          }
        />

        {/* --- Nhóm 2: Các Route cần đăng nhập (mọi vai trò) --- */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["user", "moderator", "admin"]} />
          }
        >
          <Route
            path="/family-tree"
            element={
              <PublicContentLayout>
                <FamilyTreePage />
              </PublicContentLayout>
            }
          />
          {/* Ví dụ: Thêm các route khác cho user ở đây */}
          {/* <Route path="/profile" element={<PublicContentLayout><ProfilePage /></PublicContentLayout>} /> */}
        </Route>

        {/* --- Nhóm 3: Khu vực Quản trị (Admin Area) --- */}
        <Route
          element={
            // Cổng kiểm soát 1: Kiểm tra quyền truy cập vào toàn bộ khu vực /admin
            <ProtectedRoute allowedRoles={["admin", "moderator"]} />
          }
        >
          <Route
            path="/admin"
            element={
              // Cổng kiểm soát 2: Áp dụng layout chung cho các trang con
              <AdminLayout />
            }
          >
            {/* Các route con sẽ được render bên trong <Outlet /> của AdminLayout */}

            {/* Route mặc định khi vào /admin, thường là dashboard */}
            {/* index={true} có nghĩa là route này sẽ được render khi path khớp với cha của nó */}
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route
              path="family-tree-management"
              element={<FamilyTreeManagementPage />}
            />
            {/* Cổng kiểm soát 3 (lồng vào trong): Chỉ admin mới vào được route này */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="users" element={<UsersPage />} />
            </Route>

            {/* Ví dụ: Thêm các route admin khác ở đây */}
            {/* <Route path="settings" element={<SettingsPage />} /> */}
          </Route>
        </Route>

        {/* --- Nhóm 4: Route bắt lỗi 404 --- */}
        <Route
          path="*"
          element={
            <PublicContentLayout>
              <h1>404: Trang không tồn tại</h1>
            </PublicContentLayout>
          }
        />
      </Routes>
    </Layout>
  );
}

// Component phụ để tạo layout cho các trang không thuộc khu vực admin
// Nó tạo ra một khoảng trống cho Navbar và một khung nội dung màu trắng.
const PublicContentLayout = ({ children }: { children: React.ReactNode }) => (
  <Content style={{ padding: "24px 48px", marginTop: 64 }}>
    {" "}
    {/* marginTop 64px bằng chiều cao Header của Navbar */}
    <div
      style={{
        background: "#fff",
        minHeight: "calc(100vh - 160px)",
        padding: 24,
        borderRadius: 8,
      }}
    >
      {children}
    </div>
  </Content>
);

export default App;
