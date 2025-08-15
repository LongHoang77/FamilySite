import { Typography, Button } from "antd";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", paddingTop: "50px" }}>
      <Title>Chào mừng đến với FamilySite</Title>
      <Paragraph
        style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
      >
        Nơi lưu giữ những kỷ niệm và kết nối các thành viên trong gia đình.
      </Paragraph>
      <div style={{ marginTop: "30px" }}>
        {isAuthenticated ? (
          <Title level={4}>Xin chào, {user?.name}!</Title>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/login")}
          >
            Bắt đầu ngay
          </Button>
        )}
      </div>
    </div>
  );
};

export default HomePage;
