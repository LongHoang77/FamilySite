/* eslint-disable @typescript-eslint/no-explicit-any */
import { Menu, Skeleton } from "antd";
import { useQuery } from "@tanstack/react-query";
import { NavLink, useLocation } from "react-router-dom";
import * as AntIcons from "@ant-design/icons";
import apiService from "../../services/apiService";
import type { MenuProps } from "antd";

// Định nghĩa một kiểu MenuItem đơn giản hơn để làm việc
// và ép kiểu (cast) nó thành kiểu của AntD ở cuối.
// Đây là một kỹ thuật phổ biến để làm việc với các kiểu phức tạp.
interface AppMenuItem {
  key: React.Key;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: AppMenuItem[];
}

// Interface cho dữ liệu từ API
interface SidebarItem {
  _id: string;
  key: string;
  name: string;
  path?: string;
  icon?: string;
  parent?: string | null;
}

// Lọc các icon hợp lệ (giữ nguyên)
const Icons: { [key: string]: React.ComponentType<any> } = Object.keys(AntIcons)
  .filter(
    (key) =>
      typeof (AntIcons as any)[key] === "object" &&
      (AntIcons as any)[key].displayName
  )
  .reduce((acc, key) => {
    acc[key] = (AntIcons as any)[key];
    return acc;
  }, {} as { [key: string]: React.ComponentType<any> });

const fetchSidebarItems = async (): Promise<SidebarItem[]> => {
  const { data } = await apiService.get("/navigation?position=sidebar");
  return data;
};

// =================== PHIÊN BẢN SỬA LỖI MỚI ===================
const buildMenuTree = (items: SidebarItem[]): AppMenuItem[] => {
  const nodes = new Map<string, AppMenuItem & { children: AppMenuItem[] }>();
  const rootItems: AppMenuItem[] = [];

  // Bước 1: Khởi tạo tất cả các node với cấu trúc đầy đủ
  items.forEach((item) => {
    const IconComponent = item.icon ? Icons[item.icon] : null;
    nodes.set(item.key, {
      key: item.path || item.key,
      label: item.path ? (
        <NavLink to={item.path}>{item.name}</NavLink>
      ) : (
        item.name
      ),
      icon: IconComponent ? <IconComponent /> : null,
      children: [], // Luôn khởi tạo là mảng
    });
  });

  // Bước 2: Liên kết các node cha-con
  items.forEach((item) => {
    const node = nodes.get(item.key);
    if (node) {
      // Đảm bảo node tồn tại
      if (item.parent && nodes.has(item.parent)) {
        const parentNode = nodes.get(item.parent);
        parentNode?.children.push(node);
      } else {
        rootItems.push(node);
      }
    }
  });

  // Bước 3: Dọn dẹp thuộc tính children rỗng (tùy chọn nhưng tốt cho sự gọn gàng)
  // AntD sẽ không render SubMenu nếu 'children' là mảng rỗng, nên bước này không bắt buộc
  // nhưng nó giúp cấu trúc dữ liệu cuối cùng sạch hơn.
  const cleanEmptyChildren = (menuItems: AppMenuItem[]): AppMenuItem[] => {
    return menuItems.map((item) => {
      if (item.children && item.children.length > 0) {
        return { ...item, children: cleanEmptyChildren(item.children) };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { children, ...rest } = item; // Loại bỏ thuộc tính 'children'
      return rest;
    });
  };

  return cleanEmptyChildren(rootItems);
};
// =================== KẾT THÚC PHIÊN BẢN MỚI ===================

const AdminSidebar = () => {
  const location = useLocation();

  const { data: sidebarItems, isLoading } = useQuery({
    queryKey: ["sidebarItems"],
    queryFn: fetchSidebarItems,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div style={{ padding: "24px" }}>
        <Skeleton active paragraph={{ rows: 5 }} title={false} />
      </div>
    );
  }

  const menuTree = sidebarItems ? buildMenuTree(sidebarItems) : [];

  const getOpenKeys = (): string[] => {
    const currentPath = location.pathname;
    const parentKey = sidebarItems?.find(
      (item) => item.path === currentPath
    )?.parent;
    return parentKey ? [parentKey] : [];
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultOpenKeys={getOpenKeys()}
      selectedKeys={[location.pathname]}
      // Ép kiểu (type casting) ở đây để báo cho TypeScript rằng chúng ta biết
      // cấu trúc của 'menuTree' là tương thích với những gì AntD cần.
      items={menuTree as MenuProps["items"]}
    />
  );
};

export default AdminSidebar;
