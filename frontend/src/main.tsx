import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import App from "./App.tsx";
import "antd/dist/reset.css"; // AntD CSS Reset

// Tạo một instance của QueryClient
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#4361ee",
              borderRadius: 6,
              fontFamily: "Poppins, sans-serif", // Áp dụng font
            },
          }}
        >
          {/* AntApp để sử dụng các API tĩnh như message, notification, modal */}
          <AntApp>
            <AuthProvider>
              <App />
            </AuthProvider>
          </AntApp>
        </ConfigProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
