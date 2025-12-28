/**
 * 基础布局
 */
import { Layout, Menu, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  PrinterOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAppStore, useUserStore } from '@/store';
import { dynamicRoutes } from '@/router/routes';
import { routesToMenus } from '@/router/utils';
import { getCachedUserInfo } from '@/services/auth';
import './index.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 响应式断点
const MOBILE_BREAKPOINT = 768;

export default function BasicLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { collapsed, setCollapsed, toggleCollapsed } = useAppStore();
  const userInfo = useUserStore((state) => state.userInfo) || getCachedUserInfo();
  const [isMobile, setIsMobile] = useState(false);
  
  const menus = routesToMenus(dynamicRoutes);
  
  // 转换菜单格式以匹配Ant Design Menu组件
  const menuItems = menus.map(menu => ({
    key: menu.key,
    label: menu.label,
    icon: menu.icon,
    children: menu.children?.map(child => ({
      key: child.key,
      label: child.label,
    })),
  }));
  
  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人信息',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: '系统设置',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
    },
  ];

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        // 跳转到个人信息页面
        break;
      case 'settings':
        // 跳转到系统设置页面
        break;
      case 'logout':
        // 退出登录
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
        break;
    }
  };
  
  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width < MOBILE_BREAKPOINT;
      
      setIsMobile(mobile);
      
      // 小屏幕自动收起侧边栏
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };
    
    // 初始化检查
    handleResize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [collapsed, setCollapsed]);
  
  return (
    <Layout style={{ minHeight: '100vh' }} className={isMobile ? 'mobile-layout' : ''}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={toggleCollapsed}
        breakpoint="md"
        collapsedWidth={isMobile ? 0 : 80}
        trigger={null}
        className="layout-sider"
        theme="dark"
      >
        <div className="logo">
          <PrinterOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          {!collapsed && <span className="logo-text">条码打印管理系统</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="layout-content">
        <Header className="layout-header">
          <div className="header-left">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleCollapsed}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <div className="header-title">
              <Text strong style={{ fontSize: '18px', color: '#333' }}>
                条码打印管理系统
              </Text>
            </div>
          </div>
          
          <div className="header-right">
            <Space size="middle">
              <Text type="secondary">
                欢迎，{userInfo?.userName || '用户'}
              </Text>
              <Dropdown
                menu={{
                  items: userMenuItems,
                  onClick: handleUserMenuClick,
                }}
                placement="bottomRight"
                arrow
              >
                <Avatar 
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </Space>
          </div>
        </Header>
        <Content className="layout-main">
          <div className="content-wrapper">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
