import { Layout, Menu, Avatar, Dropdown, Button, Space } from "antd";
import { UserOutlined, LogoutOutlined, CrownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/apiService";
import type { INavigationItem } from "../../interfaces";

const { Header } = Layout;

// Hàm gọi API để lấy các mục menu cho navbar
const fetchNavbarItems = async (): Promise<INavigationItem[]> => {
  const { data } = await apiService.get("/navigation?position=navbar");
  return data;
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { data: navItems } = useQuery({
    queryKey: ["navbarItems"],
    queryFn: fetchNavbarItems,
    enabled: isAuthenticated, // Chỉ fetch khi đã đăng nhập
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // --- Logic xây dựng Menu Items ---
  const menuItemsFromAPI =
    navItems?.map((item) => ({
      // Dùng item.key vì nó luôn tồn tại và duy nhất
      key: item.key,
      // Label là một NavLink trỏ đến item.path
      label: <NavLink to={item.path || "/"}>{item.name}</NavLink>,
    })) || [];

  const finalMenuItems: MenuProps["items"] = [
    ...menuItemsFromAPI,
    // Thêm nút "Trang Admin" nếu người dùng có quyền
    ...(user && ["admin", "moderator"].includes(user.role)
      ? [
          {
            key: "admin-dashboard", // Key phải là duy nhất
            label: <NavLink to="/admin/dashboard">Trang Admin</NavLink>,
            icon: <CrownOutlined />,
          },
        ]
      : []),
  ];

  // --- Logic xây dựng Dropdown Items ---
  const dropdownItems: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ", icon: <UserOutlined /> },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "fixed",
        width: "100%",
        zIndex: 10,
        top: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            color: "white",
            marginRight: "2rem",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          <NavLink to="/" style={{ color: "white", textDecoration: "none" }}>
            FamilySite
          </NavLink>
        </div>
        {isAuthenticated && (
          <Menu
            theme="dark"
            mode="horizontal"
            items={finalMenuItems}
            style={{ flex: 1, minWidth: 0, borderBottom: "none" }}
            // Không cần selectedKeys vì NavLink sẽ tự xử lý active style
          />
        )}
      </div>

      <div>
        {isAuthenticated && user ? (
          <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
            <a
              onClick={(e) => e.preventDefault()}
              style={{ cursor: "pointer" }}
            >
              <Space>
                <Avatar src={user.avatar} icon={<UserOutlined />} />
                <span style={{ color: "white" }}>{user.name}</span>
              </Space>
            </a>
          </Dropdown>
        ) : (
          <Space>
            <Button onClick={() => navigate("/login")}>Đăng nhập</Button>
            <Button type="primary" onClick={() => navigate("/register")}>
              Đăng ký
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
