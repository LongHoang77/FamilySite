# 🏡 FamilySite

**FamilySite** là một ứng dụng web riêng tư dành cho gia đình, cung cấp một không gian an toàn để các thành viên tương tác, chia sẻ và quản lý thông tin gia phả. Dự án được xây dựng với **React/TypeScript** cho frontend và **Node.js/Express/TypeScript** cho backend, sử dụng **MongoDB Atlas** để lưu trữ dữ liệu.

---

## 📌 1. Bối cảnh & Mục tiêu

Bạn sẽ tiếp nhận vai trò **Lập trình viên Full-stack** cho dự án "FamilySite".  
Mục tiêu chính:
- Tạo nền tảng an toàn để thành viên đăng nhập và tương tác.
- Hiển thị **Cây Gia Phả (Family Tree)** trực quan, có thể tương tác.
- Cung cấp **Admin Panel** mạnh mẽ để quản lý người dùng, dữ liệu gia phả, và cấu trúc menu trang web.

---

## 🛠 2. Stack Công Nghệ

**Frontend**
- React 18 + TypeScript  
- Vite  
- React Router v6  
- TanStack Query v5  
- React Hook Form + Zod  
- Ant Design v5  
- React Flow v11  

**Backend**
- Node.js + Express + TypeScript  
- Mongoose + MongoDB Atlas  
- JWT (Access & Refresh Token)  
- Cookie-Parser  

**Môi trường Dev**
- Sử dụng `concurrently` để chạy frontend + backend cùng lúc bằng một lệnh.

---

## ✅ 3. Trạng thái Hiện tại

### Backend
- ✔ Kiến trúc module hóa (controllers, models, routes, middleware).  
- ✔ Hệ thống xác thực JWT & phân quyền (user, moderator, admin).  
- ✔ API CRUD cho Users và Family Members (tự đồng bộ mối quan hệ).  
- ✔ API `GET /api/navigation?position=...` lấy menu động.  
- ✔ API `POST /api/family-members/by-ids` tối ưu tốc độ tải dữ liệu form gia phả.  

### Frontend
- ✔ Kiến trúc module hóa, tích hợp Ant Design, AuthContext, TanStack Query.  
- ✔ Routing đầy đủ (public/private) & layout riêng cho Admin.  
- ✔ Navbar, Admin Layout, Admin Sidebar lấy dữ liệu động từ API.  
- ✔ Trang Quản lý Users (CRUD) hoàn thiện.  
- ✔ Trang Quản lý Gia phả: dùng Drawer xem chi tiết, bỏ expandable lỗi.  
- ✔ Trang Family Tree (/family-tree) hiển thị chuẩn layout phân cấp, xử lý vợ/chồng ngang hàng.  
- ✔ Trang Dashboard (Admin) tái thiết kế với thống kê & biểu đồ trực quan.  

---

## 📋 4. Công việc tiếp theo (TODO)

### 🔥 Ưu tiên cao
**Hoàn thiện Quản lý Menu (Navigation)**  
- Backend: CRUD API cho NavigationItem (POST, PUT, DELETE) – chỉ admin được phép.  
- Frontend: Trang `Admin/NavigationManagementPage.tsx` với bảng `<Table>` + Form Modal cho phép thêm/sửa/xóa menu.  
- Tích hợp TanStack Query để tự động cập nhật UI.  

### ⚡ Ưu tiên trung bình
**Tính năng Upload & Hồ sơ cá nhân**  
- Backend: Tích hợp `multer` + `cloudinary`, API upload avatar, cập nhật hồ sơ, đổi mật khẩu.  
- Frontend: Trang `/profile` với `<Upload>` và form đổi tên/mật khẩu.  

### 💤 Ưu tiên thấp
**Tối ưu & Trau chuốt**  
- Lazy Loading các page (`React.lazy` + `<Suspense>`).  
- Empty States (`<Empty>` của AntD) khi không có dữ liệu.  

---

# ======== 🚀 Setup & Chạy dự án ========

# 1. Clone repo
git clone https://github.com/<username>/<repo>.git
cd <repo>

# 2. Cài đặt dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Tạo file .env cho backend
cd ../backend
cat > .env <<EOL
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/db_name
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EOL

# 4. Chạy dự án (mở 2 terminal hoặc dùng concurrently nếu có)
# Terminal 1 - Backend
npm run dev &
# Terminal 2 - Frontend
cd ../frontend && npm run dev

