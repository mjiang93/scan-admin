/**
 * 权限管理核心逻辑测试
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  loadPermissions,
  hasPagePermission,
  hasButtonPermission,
  hasAllPermissions,
  hasAnyPermission,
  updatePermissions,
  clearPermissions,
} from '../permission';
import { usePermissionStore } from '@/store/permission';

describe('Permission Management', () => {
  beforeEach(() => {
    // 清除权限状态
    clearPermissions();
  });

  // **Feature: admin-management-system, Property 6: 权限加载一致性**
  // **验证需求: Requirements 2.1**
  describe('Property 6: 权限加载一致性', () => {
    it('对于任意用户角色，系统加载权限时应该返回与该角色关联的完整权限列表', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 50 }),
          (permissions) => {
            // 加载权限
            loadPermissions(permissions);

            // 获取存储的权限
            const storedPermissions = usePermissionStore.getState().permissions;

            // 验证权限列表完整性
            expect(storedPermissions).toEqual(permissions);
            expect(storedPermissions.length).toBe(permissions.length);

            // 验证每个权限都被正确存储
            permissions.forEach((permission) => {
              expect(storedPermissions).toContain(permission);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('多次加载相同权限应该返回一致的结果', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 30 }),
          (permissions) => {
            // 第一次加载
            loadPermissions(permissions);
            const firstLoad = usePermissionStore.getState().permissions;

            // 第二次加载相同权限
            loadPermissions(permissions);
            const secondLoad = usePermissionStore.getState().permissions;

            // 验证一致性
            expect(firstLoad).toEqual(secondLoad);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 7: 页面权限验证**
  // **验证需求: Requirements 2.2**
  describe('Property 7: 页面权限验证', () => {
    it('对于任意页面路由和用户权限组合，系统应该正确判断用户是否有权访问该页面', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (userPermissions, pagePermission) => {
            // 加载用户权限
            loadPermissions(userPermissions);

            // 验证页面权限
            const hasAccess = hasPagePermission(pagePermission);

            // 验证结果正确性
            const expected = userPermissions.includes(pagePermission);
            expect(hasAccess).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('空权限要求应该允许所有用户访问', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 30 }),
          (userPermissions) => {
            loadPermissions(userPermissions);

            // 空字符串权限要求
            expect(hasPagePermission('')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('用户拥有的权限应该始终返回true', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          (userPermissions) => {
            loadPermissions(userPermissions);

            // 验证用户拥有的每个权限
            userPermissions.forEach((permission) => {
              expect(hasPagePermission(permission)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 9: 按钮权限控制**
  // **验证需求: Requirements 2.4**
  describe('Property 9: 按钮权限控制', () => {
    it('对于任意按钮权限配置，系统应该根据用户权限正确显示或隐藏按钮', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          fc.string({ minLength: 1, maxLength: 20 }),
          (userPermissions, buttonPermission) => {
            // 加载用户权限
            loadPermissions(userPermissions);

            // 验证按钮权限
            const hasAccess = hasButtonPermission(buttonPermission);

            // 验证结果正确性
            const expected = userPermissions.includes(buttonPermission);
            expect(hasAccess).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('空权限要求的按钮应该对所有用户可见', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 30 }),
          (userPermissions) => {
            loadPermissions(userPermissions);

            // 空字符串权限要求
            expect(hasButtonPermission('')).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 10: 权限更新同步**
  // **验证需求: Requirements 2.5**
  describe('Property 10: 权限更新同步', () => {
    it('对于任意用户权限修改操作，系统应该更新权限数据', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          (initialPermissions, updatedPermissions) => {
            // 加载初始权限
            loadPermissions(initialPermissions);
            const beforeUpdate = usePermissionStore.getState().permissions;
            expect(beforeUpdate).toEqual(initialPermissions);

            // 更新权限
            updatePermissions(updatedPermissions);
            const afterUpdate = usePermissionStore.getState().permissions;

            // 验证权限已更新
            expect(afterUpdate).toEqual(updatedPermissions);
            expect(afterUpdate).not.toEqual(initialPermissions);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('权限更新后，权限验证应该使用新的权限列表', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 20 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 20 }),
          (initialPermissions, updatedPermissions) => {
            // 确保两个权限列表不同
            fc.pre(
              JSON.stringify(initialPermissions.sort()) !==
                JSON.stringify(updatedPermissions.sort())
            );

            // 加载初始权限
            loadPermissions(initialPermissions);

            // 更新权限
            updatePermissions(updatedPermissions);

            // 验证新权限生效
            updatedPermissions.forEach((permission) => {
              expect(hasPagePermission(permission)).toBe(true);
              expect(hasButtonPermission(permission)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // 额外的辅助函数测试
  describe('Additional Permission Utilities', () => {
    it('hasAllPermissions - 验证多个权限（需要全部满足）', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          (userPermissions, requiredPermissions) => {
            loadPermissions(userPermissions);

            const hasAll = hasAllPermissions(requiredPermissions);
            const expected = requiredPermissions.every((p) => userPermissions.includes(p));

            expect(hasAll).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('hasAnyPermission - 验证多个权限（满足任一即可）', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 30 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          (userPermissions, requiredPermissions) => {
            loadPermissions(userPermissions);

            const hasAny = hasAnyPermission(requiredPermissions);
            const expected = requiredPermissions.some((p) => userPermissions.includes(p));

            expect(hasAny).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
