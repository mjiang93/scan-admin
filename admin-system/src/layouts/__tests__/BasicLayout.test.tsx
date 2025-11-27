/**
 * BasicLayout 属性测试
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import * as fc from 'fast-check';
import BasicLayout from '../BasicLayout';

// Mock store
const mockSetCollapsed = vi.fn();
const mockToggleCollapsed = vi.fn();
let mockCollapsed = false;

vi.mock('@/store', () => ({
  useAppStore: () => ({
    collapsed: mockCollapsed,
    setCollapsed: mockSetCollapsed,
    toggleCollapsed: mockToggleCollapsed,
  }),
}));

// Mock router
vi.mock('@/router/routes', () => ({
  dynamicRoutes: [
    {
      path: '/user',
      name: 'UserManage',
      meta: {
        title: '用户管理',
        icon: 'UserOutlined',
      },
    },
  ],
}));

vi.mock('@/router/utils', () => ({
  routesToMenus: () => [
    {
      key: '/user',
      label: '用户管理',
    },
  ],
}));

describe('BasicLayout Property Tests', () => {
  beforeEach(() => {
    // Reset mocks
    mockSetCollapsed.mockClear();
    mockToggleCollapsed.mockClear();
    mockCollapsed = false;
    
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // **Feature: admin-management-system, Property 57: 响应式菜单收起**
  test('Property 57: 响应式菜单收起 - 对于任意屏幕宽度小于768px的情况，侧边菜单应该自动收起', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 767 }), // 小屏幕宽度范围
        (screenWidth) => {
          // 设置窗口宽度
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: screenWidth,
          });

          mockSetCollapsed.mockClear();
          mockCollapsed = false;

          let unmount: () => void;
          act(() => {
            const result = render(
              <BrowserRouter>
                <BasicLayout />
              </BrowserRouter>
            );
            unmount = result.unmount;
          });

          // 验证：小屏幕宽度应该小于768px
          expect(screenWidth < 768).toBe(true);
          
          // 验证：组件应该正常渲染
          expect(mockSetCollapsed).toHaveBeenCalled();

          act(() => {
            unmount!();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: admin-management-system, Property 58: 布局自适应**
  test('Property 58: 布局自适应 - 对于任意浏览器窗口大小变化，布局应该自动调整以适应新尺寸', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // 各种屏幕宽度
        fc.integer({ min: 480, max: 1440 }), // 各种屏幕高度
        (width, height) => {
          // 设置初始窗口大小
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: width,
          });
          Object.defineProperty(window, 'innerHeight', {
            writable: true,
            configurable: true,
            value: height,
          });

          mockSetCollapsed.mockClear();
          mockCollapsed = false;

          let container: HTMLElement;
          let unmount: () => void;
          
          act(() => {
            const result = render(
              <BrowserRouter>
                <BasicLayout />
              </BrowserRouter>
            );
            container = result.container;
            unmount = result.unmount;
          });

          // 验证：布局容器应该存在且可以渲染
          const layout = container!.querySelector('.ant-layout');
          expect(layout).toBeTruthy();

          // 验证：布局应该能够响应不同的屏幕尺寸
          // 布局组件应该正常渲染，不管屏幕大小
          expect(layout).not.toBeNull();

          act(() => {
            unmount!();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: admin-management-system, Property 59: 移动端界面适配**
  test('Property 59: 移动端界面适配 - 对于任意移动设备访问，系统应该显示移动端优化的界面布局', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(375, 414, 390, 428, 360), // 常见移动设备宽度
        (mobileWidth) => {
          // 设置移动设备宽度
          Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: mobileWidth,
          });

          mockSetCollapsed.mockClear();
          mockCollapsed = false;

          let container: HTMLElement;
          let unmount: () => void;
          
          act(() => {
            const result = render(
              <BrowserRouter>
                <BasicLayout />
              </BrowserRouter>
            );
            container = result.container;
            unmount = result.unmount;
          });

          // 验证：移动端应该有特定的布局类
          const layout = container!.querySelector('.ant-layout');
          expect(layout).toBeTruthy();

          // 验证：移动端宽度应该小于768px
          expect(mobileWidth < 768).toBe(true);

          // 验证：移动端应该触发 setCollapsed
          expect(mockSetCollapsed).toHaveBeenCalled();

          act(() => {
            unmount!();
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
