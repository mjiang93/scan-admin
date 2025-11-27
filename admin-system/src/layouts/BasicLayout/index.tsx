/**
 * 基础布局
 */
import { Layout, Menu } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { dynamicRoutes } from '@/router/routes';
import { routesToMenus } from '@/router/utils';
import './index.css';

const { Header, Sider, Content } = Layout;

// 响应式断点
const MOBILE_BREAKPOINT = 768;

export default function BasicLayout() {
  const navigate = useNavigate();
  const { collapsed, setCollapsed, toggleCollapsed } = useAppStore();
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
      >
        <div className="logo">{collapsed ? '系统' : '管理系统'}</div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout className="layout-content">
        <Header style={{ background: '#fff', padding: '0 16px' }} className="layout-header">
          <h2>管理系统</h2>
        </Header>
        <Content style={{ margin: '16px' }} className="layout-main">
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
