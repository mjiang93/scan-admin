/**
 * 应用入口
 * 集成路由、状态管理、全局Loading、错误边界
 */
import { useEffect } from 'react';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { AppRouter } from './router';
import { ErrorBoundary, GlobalLoading } from './components';
import { useAppInit } from './hooks/useAppInit';
import './assets/styles/reset.css';
import './assets/styles/global.css';

/**
 * 全局消息监听器
 * 监听来自工具函数的消息事件并显示通知
 */
function GlobalMessageListener() {
  const { message } = AntdApp.useApp();

  useEffect(() => {
    const handleErrorMessage = (event: CustomEvent) => {
      const { message: errorMessage } = event.detail;
      message.error(errorMessage);
    };

    // 监听错误消息事件
    window.addEventListener('showErrorMessage', handleErrorMessage as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('showErrorMessage', handleErrorMessage as EventListener);
    };
  }, [message]);

  return null; // 这个组件不渲染任何内容
}

/**
 * Ant Design 主题配置
 */
const themeConfig = {
  token: {
    // 主色调
    colorPrimary: '#1890ff',
    // 成功色
    colorSuccess: '#52c41a',
    // 警告色
    colorWarning: '#faad14',
    // 错误色
    colorError: '#f5222d',
    // 信息色
    colorInfo: '#1890ff',
    // 边框圆角
    borderRadius: 4,
    // 字体大小
    fontSize: 14,
    // 线框风格
    wireframe: false,
  },
  algorithm: theme.defaultAlgorithm,
  components: {
    // 表格组件配置
    Table: {
      headerBg: '#fafafa',
      headerColor: '#333',
      rowHoverBg: '#f5f5f5',
    },
    // 按钮组件配置
    Button: {
      primaryShadow: '0 2px 0 rgba(24, 144, 255, 0.1)',
    },
    // 菜单组件配置
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
    },
    // 布局组件配置
    Layout: {
      headerBg: '#001529',
      siderBg: '#001529',
      bodyBg: '#f0f2f5',
    },
  },
};

/**
 * 全局错误处理回调
 */
const handleGlobalError = (error: Error, errorInfo: React.ErrorInfo) => {
  // 记录错误日志
  console.error('Global Error:', {
    error: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
  });
  
  // 可以在这里发送错误到日志服务
  // logService.reportError(error, errorInfo);
};

/**
 * 应用内容组件
 */
function AppContent() {
  // 初始化应用状态
  useAppInit();

  return (
    <AntdApp>
      {/* 全局消息监听器 */}
      <GlobalMessageListener />
      {/* 全局 Loading */}
      <GlobalLoading tip="加载中..." />
      {/* 路由系统 */}
      <AppRouter />
    </AntdApp>
  );
}

/**
 * 应用根组件
 * 集成以下功能：
 * 1. 全局错误边界 - 捕获并处理 React 组件错误
 * 2. Ant Design 配置 - 主题、国际化
 * 3. 全局 Loading - 显示全局加载状态
 * 4. 路由系统 - 动态路由和路由守卫
 * 5. 应用初始化 - 恢复用户状态
 */
function App() {
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <ConfigProvider locale={zhCN} theme={themeConfig}>
        <AppContent />
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;
