import React, { useState } from "react";
import { Layout, Button, Avatar, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import AdminSidebar from "./AdminSidebar";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const dropdownItems: MenuProps["items"] = [
    { key: "profile", label: "Hồ sơ", icon: <UserOutlined /> },
    {
      key: "gohome",
      label: <NavLink to="/">Về trang chủ</NavLink>,
      icon: <HomeOutlined />,
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sider: Chứa Sidebar menu */}
      <Sider
        theme="dark"
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
      >
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin/dashboard")}
        >
          <img
            src="/vite.svg"
            alt="logo"
            style={{ height: 32, marginRight: collapsed ? 0 : 8 }}
          />
          {!collapsed && (
            <h1 style={{ color: "white", margin: 0, fontSize: "20px" }}>
              FamilySite
            </h1>
          )}
        </div>
        <AdminSidebar />
      </Sider>

      {/* Layout chính: Chứa Header và Content */}
      <Layout>
        {/* Header: Thanh ngang trên cùng */}
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px", width: 64, height: 64 }}
          />
          <Dropdown menu={{ items: dropdownItems }} trigger={["click"]}>
            <a
              onClick={(e) => e.preventDefault()}
              style={{ cursor: "pointer" }}
            >
              <Space>
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </Space>
            </a>
          </Dropdown>
        </Header>

        {/* Content: Vùng nội dung chính, nơi các trang con sẽ được render */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
