/**
 * 全局 Loading 组件
 * 用于显示全局加载状态
 */
import { Spin } from 'antd';
import { useAppStore } from '@/store';
import './index.css';

interface GlobalLoadingProps {
  /** 自定义加载提示文字 */
  tip?: string;
  /** 是否全屏显示 */
  fullscreen?: boolean;
}

/**
 * 全局 Loading 组件
 * 根据全局状态显示/隐藏加载动画
 */
export function GlobalLoading({ tip = '加载中...', fullscreen = true }: GlobalLoadingProps) {
  const loading = useAppStore((state) => state.loading);

  if (!loading) {
    return null;
  }

  if (fullscreen) {
    // 全屏模式使用嵌套方式
    return (
      <div className="global-loading global-loading-fullscreen">
        <Spin size="large" spinning={true} tip={tip}>
          <div style={{ minHeight: '100px', width: '100px' }} />
        </Spin>
      </div>
    );
  }

  // 非全屏模式不使用tip，改为自定义文字显示
  return (
    <div className="global-loading">
      <div className="loading-content">
        <Spin size="large" />
        <div className="loading-tip">{tip}</div>
      </div>
    </div>
  );
}

/**
 * 页面级 Loading 组件
 * 用于路由懒加载时的加载状态
 */
export function PageLoading({ tip = '页面加载中...' }: { tip?: string }) {
  return (
    <div className="page-loading">
      <Spin size="large" spinning={true} tip={tip}>
        <div style={{ minHeight: '200px', width: '100%' }} />
      </Spin>
    </div>
  );
}

export default GlobalLoading;
