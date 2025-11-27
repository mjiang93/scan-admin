/**
 * 用户布局（用于登录页）
 */
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import './index.css';

const { Content } = Layout;

export default function UserLayout() {
  return (
    <Layout className="user-layout">
      <Content className="user-layout-content">
        <div className="user-layout-container">
          <div className="user-layout-header">
            <h1>管理系统</h1>
            <p>欢迎使用企业级管理系统</p>
          </div>
          <div className="user-layout-main">
            <Outlet />
          </div>
        </div>
      </Content>
    </Layout>
  );
}
