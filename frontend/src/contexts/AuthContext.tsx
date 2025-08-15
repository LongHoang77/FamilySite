/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useEffect,
  type ReactNode,
  useContext,
} from "react";
import type { IUser } from "../interfaces";
import apiService from "../services/apiService";
import { jwtDecode } from "jwt-decode";

// Định nghĩa kiểu dữ liệu cho context
interface AuthContextType {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Tạo context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tạo Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Bắt đầu với trạng thái loading

  // Hàm kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          // Giải mã token để kiểm tra hạn sử dụng (tùy chọn, để tăng tốc)
          const decoded: { exp: number } = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            // Nếu token còn hạn, gọi API để lấy thông tin user mới nhất
            const { data: userData } = await apiService.get<IUser>("/auth/me");
            setUser(userData);
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          localStorage.removeItem("accessToken");
          setUser(null);
        }
      }
      setIsLoading(false); // Kết thúc loading
    };

    checkAuthStatus();
  }, []);

  const login = async (accessToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    const { data: userData } = await apiService.get<IUser>("/auth/me");
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout API call failed, but clearing session anyway.",
        error
      );
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {/* Chỉ render nội dung khi đã kiểm tra xong, tránh nhấp nháy UI */}
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Tạo custom hook để sử dụng context dễ dàng hơn
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
