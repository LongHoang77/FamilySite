/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiService = axios.create({
  baseURL,
  withCredentials: true, // Cho phép gửi cookie (chứa refreshToken)
});

// Interceptor 1: Gắn Access Token vào header trước mỗi request
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Biến để quản lý trạng thái refresh token
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Interceptor 2: Xử lý khi Access Token hết hạn (lỗi 401)
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có một request refresh token khác chạy, thêm request hiện tại vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiService(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gửi request để lấy accessToken mới
        const { data } = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = data;

        // Lưu token mới và xử lý hàng đợi
        localStorage.setItem("accessToken", accessToken);
        apiService.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        // Gửi lại request ban đầu với token mới
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return apiService(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Nếu refreshToken thất bại -> Đăng xuất người dùng
        localStorage.removeItem("accessToken");
        window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiService;
