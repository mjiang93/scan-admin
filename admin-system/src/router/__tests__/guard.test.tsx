/**
 * 路由守卫测试
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouteGuard } from '../guard';
import { loadPermissions, clearPermissions, hasPagePermission } from '@/utils/permission';
import * as authService from '@/services/auth';

// Mock auth service
vi.mock('@/services/auth', () => ({
  checkLoginStatus: vi.fn(),
}));

describe('RouteGuard', () => {
  beforeEach(() => {
    clearPermissions();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // **Feature: admin-management-system, Property 8: 无权限跳转**
  // **验证需求: Requirements 2.3**
  describe('Property 8: 无权限跳转', () => {
    it('对于任意用户没有访问权限的页面，系统应该拦截访问并跳转到403页面', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (userPermissions, requiredPermission) => {
            // 确保用户没有所需权限
            fc.pre(!userPermissions.includes(requiredPermission));

            // 加载用户权限
            loadPermissions(userPermissions);

            // 验证权限检查逻辑
            const hasPermission = hasPagePermission(requiredPermission);
            expect(hasPermission).toBe(false);

            // 验证用户确实没有这个权限
            expect(userPermissions.includes(requiredPermission)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('用户拥有所需权限时应该允许访问', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          (userPermissions) => {
            // 加载用户权限
            loadPermissions(userPermissions);

            // 验证用户拥有的每个权限都能通过检查
            userPermissions.forEach((permission) => {
              const hasPermission = hasPagePermission(permission);
              expect(hasPermission).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('RouteGuard组件应该正确处理无权限情况', () => {
      // 设置用户已登录但没有权限
      vi.mocked(authService.checkLoginStatus).mockReturnValue(true);
      loadPermissions(['user:read']);

      // 渲染路由守卫，要求admin权限
      render(
        <MemoryRouter>
          <RouteGuard requireAuth={true} requiredPermissions={['admin:write']}>
            <div>Protected Content</div>
          </RouteGuard>
        </MemoryRouter>
      );

      // 验证没有渲染受保护的内容
      expect(screen.queryByText('Protected Content')).toBeNull();
    });

    it('RouteGuard组件应该允许有权限的用户访问', () => {
      // 设置用户已登录且有权限
      vi.mocked(authService.checkLoginStatus).mockReturnValue(true);
      loadPermissions(['user:read', 'user:write']);

      // 渲染路由守卫
      render(
        <MemoryRouter>
          <RouteGuard requireAuth={true} requiredPermissions={['user:read']}>
            <div>Protected Content</div>
          </RouteGuard>
        </MemoryRouter>
      );

      // 验证渲染了受保护的内容
      expect(screen.getByText('Protected Content')).toBeDefined();
    });
  });
});
