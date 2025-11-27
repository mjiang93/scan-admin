/**
 * 全局错误边界组件
 * 捕获子组件树中的 JavaScript 错误，记录错误并显示备用 UI
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Result, Button } from 'antd';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件
 * 用于捕获子组件中的 JavaScript 错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // 调用外部错误处理回调
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // 记录错误日志（可以发送到日志服务）
    this.logError(error, errorInfo);
  }

  /**
   * 记录错误日志
   */
  private logError(error: Error, errorInfo: ErrorInfo): void {
    const errorLog = {
      type: 'react_error_boundary',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // 在开发环境下打印详细错误信息
    if (import.meta.env.DEV) {
      console.group('Error Boundary Log');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.log('Error Log:', errorLog);
      console.groupEnd();
    }
    
    // 生产环境可以发送到日志服务
    // TODO: 集成日志服务
  }

  /**
   * 刷新页面
   */
  private handleRefresh = (): void => {
    window.location.reload();
  };

  /**
   * 返回首页
   */
  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 如果提供了自定义 fallback，使用自定义 fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误 UI
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: '#f0f2f5'
        }}>
          <Result
            status="error"
            title="页面出现错误"
            subTitle="抱歉，页面出现了一些问题，请尝试刷新页面或返回首页"
            extra={[
              <Button key="refresh" type="primary" onClick={this.handleRefresh}>
                刷新页面
              </Button>,
              <Button key="home" onClick={this.handleGoHome}>
                返回首页
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{ 
                textAlign: 'left', 
                background: '#fff1f0', 
                padding: 16, 
                borderRadius: 4,
                marginTop: 16,
                maxWidth: 600,
                overflow: 'auto'
              }}>
                <p style={{ color: '#cf1322', fontWeight: 'bold' }}>
                  {this.state.error.message}
                </p>
                <pre style={{ 
                  fontSize: 12, 
                  color: '#666',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
