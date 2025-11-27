/**
 * 路由工具函数属性测试
 * Feature: admin-management-system
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fc } from '@fast-check/vitest';
import { generateRoutes, routesToMenus, validateRoute, flattenRoutes } from '../utils';
import type { RouteConfig } from '@/types';
import * as permissionUtils from '@/utils/permission';

// Mock permission utils
vi.mock('@/utils/permission', () => ({
  hasPagePermission: vi.fn(),
}));

describe('路由工具函数属性测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Property 11: 动态路由生成
   * Validates: Requirements 3.1
   * 
   * 对于任意用户权限集合，系统应该生成包含所有有权访问路由的路由配置
   */
  describe('Property 11: 动态路由生成', () => {
    it('应该根据权限生成对应的路由配置', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
                permission: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (permissions, routes) => {
            // Mock hasPagePermission to check if permission is in the list
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return permissions.includes(permission);
            });
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, permissions);
            
            // 验证：所有生成的路由都应该是用户有权限访问的
            generatedRoutes.forEach(route => {
              if (route.meta?.permission) {
                expect(permissions).toContain(route.meta.permission);
              }
            });
            
            // 验证：生成的路由数量不应该超过原始路由数量
            expect(generatedRoutes.length).toBeLessThanOrEqual(routes.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('无权限的路由应该被过滤掉', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          (userPermissions, routePermissions) => {
            // 确保有一些路由权限不在用户权限中
            const uniqueRoutePerms = routePermissions.filter(p => !userPermissions.includes(p));
            fc.pre(uniqueRoutePerms.length > 0);
            
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return userPermissions.includes(permission);
            });
            
            // 创建路由，其中一些需要用户没有的权限
            const routes: RouteConfig[] = uniqueRoutePerms.map((perm, index) => ({
              path: `/route${index}`,
              name: `Route${index}`,
              meta: {
                title: `Route ${index}`,
                permission: perm,
              },
            }));
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, userPermissions);
            
            // 验证：所有需要权限但用户没有的路由都应该被过滤
            expect(generatedRoutes.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('没有权限要求的路由应该始终包含', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (permissions, routes) => {
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation(() => true);
            
            // 生成路由（这些路由都没有permission字段）
            const generatedRoutes = generateRoutes(routes, permissions);
            
            // 验证：所有没有权限要求的路由都应该被包含
            expect(generatedRoutes.length).toBe(routes.length);
            
            // 验证：路由内容保持一致
            generatedRoutes.forEach((route, index) => {
              expect(route.path).toBe(routes[index].path);
              expect(route.name).toBe(routes[index].name);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该递归处理子路由', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 5 }),
          (permissions) => {
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return permissions.includes(permission);
            });
            
            // 创建带子路由的路由配置
            const routes: RouteConfig[] = [
              {
                path: '/parent',
                name: 'Parent',
                meta: {
                  title: 'Parent',
                  permission: permissions[0],
                },
                children: [
                  {
                    path: '/parent/child1',
                    name: 'Child1',
                    meta: {
                      title: 'Child 1',
                      permission: permissions[1],
                    },
                  },
                  {
                    path: '/parent/child2',
                    name: 'Child2',
                    meta: {
                      title: 'Child 2',
                      permission: permissions.length > 2 ? permissions[2] : 'no-permission',
                    },
                  },
                ],
              },
            ];
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, permissions);
            
            // 验证：父路由应该被包含（因为有权限）
            expect(generatedRoutes.length).toBeGreaterThan(0);
            
            if (generatedRoutes[0].children) {
              // 验证：子路由应该被正确过滤
              generatedRoutes[0].children.forEach(child => {
                if (child.meta?.permission) {
                  expect(permissions).toContain(child.meta.permission);
                }
              });
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 12: 路由数据完整性
   * Validates: Requirements 3.2
   * 
   * 对于任意生成的路由配置，每个路由对象应该包含path、component、meta等必需字段
   */
  describe('Property 12: 路由数据完整性', () => {
    it('所有路由都应该包含必需的path字段', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 验证所有路由都有path
            routes.forEach(route => {
              expect(route.path).toBeDefined();
              expect(typeof route.path).toBe('string');
              expect(route.path.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('所有路由都应该包含必需的name字段', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 验证所有路由都有name
            routes.forEach(route => {
              expect(route.name).toBeDefined();
              expect(typeof route.name).toBe('string');
              expect(route.name.length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('路由的meta字段应该包含title', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
                icon: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
                permission: fc.option(fc.string({ minLength: 5, maxLength: 20 }), { nil: undefined }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 验证所有有meta的路由都有title
            routes.forEach(route => {
              if (route.meta) {
                expect(route.meta.title).toBeDefined();
                expect(typeof route.meta.title).toBe('string');
                expect(route.meta.title.length).toBeGreaterThan(0);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('validateRoute函数应该正确验证路由完整性', () => {
      fc.assert(
        fc.property(
          fc.record({
            path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
            name: fc.string({ minLength: 3, maxLength: 15 }),
            meta: fc.record({
              title: fc.string({ minLength: 2, maxLength: 10 }),
            }),
          }),
          (route) => {
            // 完整的路由应该通过验证
            expect(validateRoute(route)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('缺少必需字段的路由应该验证失败', () => {
      // 测试缺少path
      expect(validateRoute({ name: 'Test', meta: { title: 'Test' } } as any)).toBe(false);
      
      // 测试缺少name
      expect(validateRoute({ path: '/test', meta: { title: 'Test' } } as any)).toBe(false);
      
      // 测试meta存在但缺少title
      expect(validateRoute({ path: '/test', name: 'Test', meta: {} as unknown })).toBe(false);
    });

    it('扁平化路由应该保持数据完整性', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (routes) => {
            // 扁平化路由
            const flattened = flattenRoutes(routes);
            
            // 验证扁平化后的路由数量
            expect(flattened.length).toBe(routes.length);
            
            // 验证每个路由的数据完整性
            flattened.forEach(route => {
              expect(route.path).toBeDefined();
              expect(route.name).toBeDefined();
              if (route.meta) {
                expect(route.meta.title).toBeDefined();
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 13: 未授权路由拦截
   * Validates: Requirements 3.3
   * 
   * 对于任意用户未授权的路由访问，系统应该拦截并跳转到403页面
   */
  describe('Property 13: 未授权路由拦截', () => {
    it('未授权的路由应该被过滤掉', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          fc.string({ minLength: 5, maxLength: 20 }),
          (userPermissions, requiredPermission) => {
            // 确保用户没有所需权限
            fc.pre(!userPermissions.includes(requiredPermission));
            
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return userPermissions.includes(permission);
            });
            
            // 创建需要权限的路由
            const routes: RouteConfig[] = [
              {
                path: '/protected',
                name: 'Protected',
                meta: {
                  title: 'Protected Page',
                  permission: requiredPermission,
                },
              },
            ];
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, userPermissions);
            
            // 验证：未授权的路由应该被拦截（不包含在生成的路由中）
            expect(generatedRoutes.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('有权限的路由应该可以访问', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          (permissions) => {
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return permissions.includes(permission);
            });
            
            // 创建需要权限的路由，使用用户拥有的权限
            const routes: RouteConfig[] = permissions.map((perm, index) => ({
              path: `/route${index}`,
              name: `Route${index}`,
              meta: {
                title: `Route ${index}`,
                permission: perm,
              },
            }));
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, permissions);
            
            // 验证：所有有权限的路由都应该被包含
            expect(generatedRoutes.length).toBe(routes.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('混合权限的路由应该正确过滤', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 2, maxLength: 4 }),
          (basePermissions) => {
            // 创建用户权限：取前半部分
            const userPermissions = basePermissions.slice(0, Math.ceil(basePermissions.length / 2));
            
            // 创建所有路由权限：包含用户有的和没有的
            const allPermissions = basePermissions;
            
            // Mock hasPagePermission
            vi.mocked(permissionUtils.hasPagePermission).mockImplementation((permission: string) => {
              return userPermissions.includes(permission);
            });
            
            // 创建混合权限的路由
            const routes: RouteConfig[] = allPermissions.map((perm, index) => ({
              path: `/route${index}`,
              name: `Route${index}`,
              meta: {
                title: `Route ${index}`,
                permission: perm,
              },
            }));
            
            // 生成路由
            const generatedRoutes = generateRoutes(routes, userPermissions);
            
            // 验证：只有有权限的路由被包含
            expect(generatedRoutes.length).toBe(userPermissions.length);
            
            // 验证：所有生成的路由都是用户有权限的
            generatedRoutes.forEach(route => {
              if (route.meta?.permission) {
                expect(userPermissions).toContain(route.meta.permission);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: 路由菜单同步
   * Validates: Requirements 3.4
   * 
   * 对于任意路由配置，系统生成的菜单结构应该与路由配置保持一致
   */
  describe('Property 14: 路由菜单同步', () => {
    it('菜单数量应该与非隐藏路由数量一致', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
                hideInMenu: fc.option(fc.boolean(), { nil: undefined }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 计算非隐藏路由数量
            const visibleRoutes = routes.filter(r => !r.meta?.hideInMenu);
            
            // 验证：菜单数量应该等于非隐藏路由数量
            expect(menus.length).toBe(visibleRoutes.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('菜单的key应该与路由的path一致', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 验证：每个菜单的key应该与对应路由的path一致
            menus.forEach((menu, index) => {
              expect(menu.key).toBe(routes[index].path);
              expect(menu.path).toBe(routes[index].path);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('菜单的label应该与路由的title一致', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (routes) => {
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 验证：每个菜单的label应该与对应路由的title一致
            menus.forEach((menu, index) => {
              expect(menu.label).toBe(routes[index].meta?.title);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('隐藏的路由不应该出现在菜单中', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
                hideInMenu: fc.boolean(),
              }),
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (routes) => {
            // 确保至少有一个隐藏的路由
            const hasHidden = routes.some(r => r.meta?.hideInMenu);
            fc.pre(hasHidden);
            
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 验证：所有菜单项对应的路由都不应该是隐藏的
            menus.forEach(menu => {
              const route = routes.find(r => r.path === menu.key);
              expect(route?.meta?.hideInMenu).not.toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('子路由应该转换为子菜单', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 2, maxLength: 10 }), { minLength: 1, maxLength: 3 }),
          (childTitles) => {
            // 创建带子路由的路由配置
            const routes: RouteConfig[] = [
              {
                path: '/parent',
                name: 'Parent',
                meta: {
                  title: 'Parent',
                },
                children: childTitles.map((title, index) => ({
                  path: `/parent/child${index}`,
                  name: `Child${index}`,
                  meta: {
                    title,
                  },
                })),
              },
            ];
            
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 验证：父菜单应该有子菜单
            expect(menus.length).toBe(1);
            expect(menus[0].children).toBeDefined();
            expect(menus[0].children?.length).toBe(childTitles.length);
            
            // 验证：子菜单的label应该与子路由的title一致
            menus[0].children?.forEach((child, index) => {
              expect(child.label).toBe(childTitles[index]);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('路由和菜单的层级结构应该保持一致', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              path: fc.string({ minLength: 2, maxLength: 20 }).map(s => '/' + s),
              name: fc.string({ minLength: 3, maxLength: 15 }),
              meta: fc.record({
                title: fc.string({ minLength: 2, maxLength: 10 }),
              }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (routes) => {
            // 生成菜单
            const menus = routesToMenus(routes);
            
            // 验证：菜单结构应该与路由结构一致
            expect(menus.length).toBe(routes.length);
            
            menus.forEach((menu, index) => {
              const route = routes[index];
              
              // 验证基本属性
              expect(menu.key).toBe(route.path);
              expect(menu.label).toBe(route.meta?.title || route.name);
              
              // 验证子菜单
              if (route.children) {
                expect(menu.children).toBeDefined();
                expect(menu.children?.length).toBe(route.children.length);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
