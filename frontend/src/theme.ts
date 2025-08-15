// frontend/src/theme.ts
import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
  token: {
    // === Màu Sắc Chủ Đạo ===
    colorPrimary: "#008080", // Một màu Teal (xanh cổ vịt) tinh tế
    colorInfo: "#008080",

    // === Font Chữ ===
    fontFamily: `'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,

    // === Giao diện chung ===
    colorBgLayout: "#f0f2f5", // Màu nền tổng thể hơi xám nhẹ, tạo chiều sâu
    borderRadius: 8, // Bo góc mềm mại hơn
  },
};

export default theme;
