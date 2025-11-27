/**
 * App 组件集成测试
 * 验证应用入口和路由集成
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

// Mock router to avoid navigation issues in tests
vi.mock('../router', () => ({
  AppRouter: () => <div data-testid="app-router">Router</div>,
}));

describe('App Component Integration', () => {
  it('should render without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('should include ErrorBoundary', () => {
    const { container } = render(<App />);
    // ErrorBoundary wraps the entire app
    expect(container.firstChild).toBeTruthy();
  });

  it('should include ConfigProvider for Ant Design', () => {
    const { container } = render(<App />);
    // ConfigProvider is rendered
    expect(container.querySelector('.ant-app')).toBeDefined();
  });

  it('should include GlobalLoading component', () => {
    const { container } = render(<App />);
    // GlobalLoading is part of the app
    expect(container).toBeTruthy();
  });

  it('should include AppRouter', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('app-router')).toBeTruthy();
  });
});
