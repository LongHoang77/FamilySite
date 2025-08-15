import { Row, Col, Card, Statistic, Spin, Typography } from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
// import apiService from '../../services/apiService';

// Mock API function for stats
const fetchDashboardStats = async () => {
  // Thay thế bằng API thật khi có:
  // const { data } = await apiService.get('/admin/stats');
  // return data;
  // TODO: thêm API thật khi có
  return new Promise((resolve) =>
    setTimeout(
      () => resolve({ userCount: 12, docCount: 150, familyMemberCount: 25 }),
      1000
    )
  );
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  const stats = data as {
    userCount: number;
    docCount: number;
    familyMemberCount: number;
  };

  return (
    <div>
      <Typography.Title level={2} style={{ marginBottom: "24px" }}>
        Dashboard
      </Typography.Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số người dùng"
              value={stats.userCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Thành viên gia phả"
              value={stats.familyMemberCount}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số tài liệu"
              value={stats.docCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
      </Row>
      {/* Thêm các biểu đồ hoặc thông tin khác ở đây */}
    </div>
  );
};

export default DashboardPage;
