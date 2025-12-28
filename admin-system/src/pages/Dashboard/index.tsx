/**
 * 仪表盘页面 - 首页
 */
import { Card, Row, Col, Statistic, Typography, Space, Button } from 'antd';
import { UserOutlined, ShoppingOutlined, DollarOutlined, TrophyOutlined } from '@ant-design/icons';
import { useUserStore } from '@/store';
import { getCachedUserInfo } from '@/services/auth';

const { Title, Text } = Typography;

export default function Dashboard() {
  const userInfo = useUserStore((state) => state.userInfo) || getCachedUserInfo();

  return (
    <div style={{ padding: '24px' }}>
      {/* 欢迎信息 */}
      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            欢迎回来，{userInfo?.userName || '用户'}！
          </Title>
          <Text type="secondary">
            今天是 {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </Text>
        </Space>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总订单数"
              value={2456}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总收入"
              value={98765}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="完成率"
              value={93.5}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" style={{ marginBottom: '24px' }}>
        <Space wrap>
          <Button type="primary" icon={<UserOutlined />}>
            用户管理
          </Button>
          <Button icon={<ShoppingOutlined />}>
            订单管理
          </Button>
          <Button>数据统计</Button>
          <Button>系统设置</Button>
        </Space>
      </Card>

      {/* 用户信息 */}
      {userInfo && (
        <Card title="当前用户信息">
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Text strong>用户ID：</Text>
              <Text>{userInfo.userId}</Text>
            </Col>
            <Col span={8}>
              <Text strong>用户名：</Text>
              <Text>{userInfo.userName}</Text>
            </Col>
            <Col span={8}>
              <Text strong>状态：</Text>
              <Text type={userInfo.status === 1 ? 'success' : 'warning'}>
                {userInfo.status === 1 ? '正常' : '待激活'}
              </Text>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
}