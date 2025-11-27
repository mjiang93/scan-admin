/**
 * 用户状态管理属性测试
 * Feature: admin-management-system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import { useUserStore } from '../user';
import { usePermissionStore } from '../permission';
import { useAppStore } from '../app';
import { UserStatus } from '@/types';

// 辅助函数：生成有效的ISO日期字符串
const validISODate = () => fc.integer({ min: 1577836800000, max: 1767225600000 }).map(timestamp => new Date(timestamp).toISOString());

describe('用户状态管理属性测试', () => {
  beforeEach(() => {
    // 清理状态
    const store = useUserStore.getState();
    store.clearUser();
    // 清理localStorage
    localStorage.clear();
  });

  /**
   * Property 52: 用户状态存储
   * Validates: Requirements 11.1
   * 
   * 对于任意用户登录操作，用户信息应该正确存储到全局状态中
   * 包括Token和用户详细信息
   */
  describe('Property 52: 用户状态存储', () => {
    it('应该正确存储Token到全局状态', () => {
      fc.assert(
        fc.property(
          // 生成随机Token
          fc.string({ minLength: 20, maxLength: 100 }),
          (token) => {
            const store = useUserStore.getState();
            
            // 设置Token
            store.setToken(token);
            
            // 验证Token已存储到状态中
            const currentState = useUserStore.getState();
            expect(currentState.token).toBe(token);
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该正确存储用户信息到全局状态', () => {
      fc.assert(
        fc.property(
          // 生成随机用户信息
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (userInfo) => {
            const store = useUserStore.getState();
            
            // 设置用户信息
            store.setUserInfo(userInfo);
            
            // 验证用户信息已存储到状态中
            const currentState = useUserStore.getState();
            expect(currentState.userInfo).toEqual(userInfo);
            
            // 验证所有字段都正确存储
            expect(currentState.userInfo?.id).toBe(userInfo.id);
            expect(currentState.userInfo?.username).toBe(userInfo.username);
            expect(currentState.userInfo?.nickname).toBe(userInfo.nickname);
            expect(currentState.userInfo?.roleId).toBe(userInfo.roleId);
            expect(currentState.userInfo?.roleName).toBe(userInfo.roleName);
            expect(currentState.userInfo?.status).toBe(userInfo.status);
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该同时存储Token和用户信息', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 模拟登录：同时设置Token和用户信息
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证两者都已存储
            const currentState = useUserStore.getState();
            expect(currentState.token).toBe(token);
            expect(currentState.userInfo).toEqual(userInfo);
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('清除用户状态应该同时清除Token和用户信息', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置Token和用户信息
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证已存储
            let currentState = useUserStore.getState();
            expect(currentState.token).toBe(token);
            expect(currentState.userInfo).toEqual(userInfo);
            
            // 清除用户状态
            store.clearUser();
            
            // 验证已清除
            currentState = useUserStore.getState();
            expect(currentState.token).toBeNull();
            expect(currentState.userInfo).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 53: 状态访问接口
   * Validates: Requirements 11.2
   * 
   * 对于任意全局状态访问，应该通过统一的接口获取状态值
   * 验证所有store都提供一致的访问接口
   */
  describe('Property 53: 状态访问接口', () => {
    it('应该通过统一接口访问用户状态', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置状态
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证可以通过getState()统一接口访问状态
            const state = useUserStore.getState();
            
            // 验证接口返回正确的状态值
            expect(state.token).toBe(token);
            expect(state.userInfo).toEqual(userInfo);
            
            // 验证接口提供所有必需的状态字段
            expect(state).toHaveProperty('token');
            expect(state).toHaveProperty('userInfo');
            expect(state).toHaveProperty('setToken');
            expect(state).toHaveProperty('setUserInfo');
            expect(state).toHaveProperty('clearUser');
            
            // 验证接口方法是函数类型
            expect(typeof state.setToken).toBe('function');
            expect(typeof state.setUserInfo).toBe('function');
            expect(typeof state.clearUser).toBe('function');
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该通过统一接口访问权限状态', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.record({
            id: fc.uuid(),
            name: fc.constantFrom('管理员', '普通用户', '访客', '编辑者'),
            code: fc.constantFrom('admin', 'user', 'guest', 'editor'),
            permissions: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
            description: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (permissions, role) => {
            const store = usePermissionStore.getState();
            
            // 设置状态
            store.setPermissions(permissions);
            store.setRole(role);
            
            // 验证可以通过getState()统一接口访问状态
            const state = usePermissionStore.getState();
            
            // 验证接口返回正确的状态值
            expect(state.permissions).toEqual(role.permissions);
            expect(state.role).toEqual(role);
            
            // 验证接口提供所有必需的状态字段
            expect(state).toHaveProperty('permissions');
            expect(state).toHaveProperty('role');
            expect(state).toHaveProperty('setPermissions');
            expect(state).toHaveProperty('setRole');
            expect(state).toHaveProperty('hasPermission');
            expect(state).toHaveProperty('clearPermissions');
            
            // 验证接口方法是函数类型
            expect(typeof state.setPermissions).toBe('function');
            expect(typeof state.setRole).toBe('function');
            expect(typeof state.hasPermission).toBe('function');
            expect(typeof state.clearPermissions).toBe('function');
            
            // 清理
            store.clearPermissions();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应该通过统一接口访问应用状态', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('light' as const, 'dark' as const),
          fc.boolean(),
          (collapsed, theme, loading) => {
            const store = useAppStore.getState();
            
            // 设置状态
            store.setCollapsed(collapsed);
            store.setTheme(theme);
            store.setLoading(loading);
            
            // 验证可以通过getState()统一接口访问状态
            const state = useAppStore.getState();
            
            // 验证接口返回正确的状态值
            expect(state.collapsed).toBe(collapsed);
            expect(state.theme).toBe(theme);
            expect(state.loading).toBe(loading);
            
            // 验证接口提供所有必需的状态字段
            expect(state).toHaveProperty('collapsed');
            expect(state).toHaveProperty('theme');
            expect(state).toHaveProperty('loading');
            expect(state).toHaveProperty('setCollapsed');
            expect(state).toHaveProperty('toggleCollapsed');
            expect(state).toHaveProperty('setTheme');
            expect(state).toHaveProperty('setLoading');
            
            // 验证接口方法是函数类型
            expect(typeof state.setCollapsed).toBe('function');
            expect(typeof state.toggleCollapsed).toBe('function');
            expect(typeof state.setTheme).toBe('function');
            expect(typeof state.setLoading).toBe('function');
            
            // 清理
            store.setCollapsed(false);
            store.setTheme('light');
            store.setLoading(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('所有store应该提供一致的getState接口', () => {
      // 验证所有store都有getState方法
      expect(typeof useUserStore.getState).toBe('function');
      expect(typeof usePermissionStore.getState).toBe('function');
      expect(typeof useAppStore.getState).toBe('function');
      
      // 验证getState返回的是对象
      expect(typeof useUserStore.getState()).toBe('object');
      expect(typeof usePermissionStore.getState()).toBe('object');
      expect(typeof useAppStore.getState()).toBe('object');
    });

    it('状态访问接口应该返回最新的状态值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.string({ minLength: 20, maxLength: 100 }),
          (token1, token2) => {
            // 确保两个token不同
            fc.pre(token1 !== token2);
            
            const store = useUserStore.getState();
            
            // 设置第一个token
            store.setToken(token1);
            let state = useUserStore.getState();
            expect(state.token).toBe(token1);
            
            // 更新为第二个token
            store.setToken(token2);
            state = useUserStore.getState();
            
            // 验证接口返回最新的状态值
            expect(state.token).toBe(token2);
            expect(state.token).not.toBe(token1);
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 54: 状态更新通知
   * Validates: Requirements 11.3
   * 
   * 对于任意全局状态更新，所有订阅该状态的组件应该收到更新通知
   * 验证Zustand的订阅机制能够正确通知所有订阅者
   */
  describe('Property 54: 状态更新通知', () => {
    it('用户状态更新应该通知所有订阅者', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 创建多个订阅者来跟踪状态更新
            const subscriber1Updates: any[] = [];
            const subscriber2Updates: any[] = [];
            const subscriber3Updates: any[] = [];
            
            // 订阅状态变化
            const unsubscribe1 = useUserStore.subscribe((state) => {
              subscriber1Updates.push({ token: state.token, userInfo: state.userInfo });
            });
            
            const unsubscribe2 = useUserStore.subscribe((state) => {
              subscriber2Updates.push({ token: state.token, userInfo: state.userInfo });
            });
            
            const unsubscribe3 = useUserStore.subscribe((state) => {
              subscriber3Updates.push({ token: state.token, userInfo: state.userInfo });
            });
            
            // 记录初始订阅者数量
            const initialCount1 = subscriber1Updates.length;
            const initialCount2 = subscriber2Updates.length;
            const initialCount3 = subscriber3Updates.length;
            
            // 更新Token
            store.setToken(token);
            
            // 验证所有订阅者都收到了Token更新通知
            expect(subscriber1Updates.length).toBeGreaterThan(initialCount1);
            expect(subscriber2Updates.length).toBeGreaterThan(initialCount2);
            expect(subscriber3Updates.length).toBeGreaterThan(initialCount3);
            
            // 验证所有订阅者收到的是相同的更新
            const lastUpdate1 = subscriber1Updates[subscriber1Updates.length - 1];
            const lastUpdate2 = subscriber2Updates[subscriber2Updates.length - 1];
            const lastUpdate3 = subscriber3Updates[subscriber3Updates.length - 1];
            
            expect(lastUpdate1.token).toBe(token);
            expect(lastUpdate2.token).toBe(token);
            expect(lastUpdate3.token).toBe(token);
            
            // 记录当前订阅者数量
            const beforeUserInfoCount1 = subscriber1Updates.length;
            const beforeUserInfoCount2 = subscriber2Updates.length;
            const beforeUserInfoCount3 = subscriber3Updates.length;
            
            // 更新用户信息
            store.setUserInfo(userInfo);
            
            // 验证所有订阅者都收到了用户信息更新通知
            expect(subscriber1Updates.length).toBeGreaterThan(beforeUserInfoCount1);
            expect(subscriber2Updates.length).toBeGreaterThan(beforeUserInfoCount2);
            expect(subscriber3Updates.length).toBeGreaterThan(beforeUserInfoCount3);
            
            // 验证所有订阅者收到的用户信息是相同的
            const lastUserUpdate1 = subscriber1Updates[subscriber1Updates.length - 1];
            const lastUserUpdate2 = subscriber2Updates[subscriber2Updates.length - 1];
            const lastUserUpdate3 = subscriber3Updates[subscriber3Updates.length - 1];
            
            expect(lastUserUpdate1.userInfo).toEqual(userInfo);
            expect(lastUserUpdate2.userInfo).toEqual(userInfo);
            expect(lastUserUpdate3.userInfo).toEqual(userInfo);
            
            // 取消订阅
            unsubscribe1();
            unsubscribe2();
            unsubscribe3();
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('权限状态更新应该通知所有订阅者', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.record({
            id: fc.uuid(),
            name: fc.constantFrom('管理员', '普通用户', '访客', '编辑者'),
            code: fc.constantFrom('admin', 'user', 'guest', 'editor'),
            permissions: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
            description: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (permissions, role) => {
            const store = usePermissionStore.getState();
            
            // 创建订阅者
            const subscriberUpdates: any[] = [];
            
            const unsubscribe = usePermissionStore.subscribe((state) => {
              subscriberUpdates.push({ permissions: state.permissions, role: state.role });
            });
            
            const initialCount = subscriberUpdates.length;
            
            // 更新权限
            store.setPermissions(permissions);
            
            // 验证订阅者收到通知
            expect(subscriberUpdates.length).toBeGreaterThan(initialCount);
            
            const beforeRoleCount = subscriberUpdates.length;
            
            // 更新角色（这会同时更新权限）
            store.setRole(role);
            
            // 验证订阅者收到角色更新通知
            expect(subscriberUpdates.length).toBeGreaterThan(beforeRoleCount);
            
            const lastUpdate = subscriberUpdates[subscriberUpdates.length - 1];
            expect(lastUpdate.role).toEqual(role);
            expect(lastUpdate.permissions).toEqual(role.permissions);
            
            // 取消订阅
            unsubscribe();
            
            // 清理
            store.clearPermissions();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应用状态更新应该通知所有订阅者', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('light' as const, 'dark' as const),
          fc.boolean(),
          (collapsed, theme, loading) => {
            const store = useAppStore.getState();
            
            // 创建订阅者
            const subscriberUpdates: any[] = [];
            
            const unsubscribe = useAppStore.subscribe((state) => {
              subscriberUpdates.push({ 
                collapsed: state.collapsed, 
                theme: state.theme, 
                loading: state.loading 
              });
            });
            
            const initialCount = subscriberUpdates.length;
            
            // 更新collapsed状态
            store.setCollapsed(collapsed);
            
            // 验证订阅者收到通知
            expect(subscriberUpdates.length).toBeGreaterThan(initialCount);
            
            const afterCollapsedCount = subscriberUpdates.length;
            
            // 更新theme
            store.setTheme(theme);
            
            // 验证订阅者收到主题更新通知
            expect(subscriberUpdates.length).toBeGreaterThan(afterCollapsedCount);
            
            const afterThemeCount = subscriberUpdates.length;
            
            // 更新loading
            store.setLoading(loading);
            
            // 验证订阅者收到loading更新通知
            expect(subscriberUpdates.length).toBeGreaterThan(afterThemeCount);
            
            const lastUpdate = subscriberUpdates[subscriberUpdates.length - 1];
            expect(lastUpdate.collapsed).toBe(collapsed);
            expect(lastUpdate.theme).toBe(theme);
            expect(lastUpdate.loading).toBe(loading);
            
            // 取消订阅
            unsubscribe();
            
            // 清理
            store.setCollapsed(false);
            store.setTheme('light');
            store.setLoading(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('取消订阅后不应该再收到更新通知', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.string({ minLength: 20, maxLength: 100 }),
          (token1, token2) => {
            // 确保两个token不同
            fc.pre(token1 !== token2);
            
            const store = useUserStore.getState();
            
            // 创建订阅者
            const subscriberUpdates: any[] = [];
            
            const unsubscribe = useUserStore.subscribe((state) => {
              subscriberUpdates.push({ token: state.token });
            });
            
            // 第一次更新
            store.setToken(token1);
            const countAfterFirstUpdate = subscriberUpdates.length;
            expect(countAfterFirstUpdate).toBeGreaterThan(0);
            
            // 取消订阅
            unsubscribe();
            
            // 第二次更新
            store.setToken(token2);
            
            // 验证取消订阅后不再收到通知
            expect(subscriberUpdates.length).toBe(countAfterFirstUpdate);
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('多次状态更新应该触发相应次数的通知', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
          (tokens) => {
            // 确保所有token都不同
            const uniqueTokens = Array.from(new Set(tokens));
            fc.pre(uniqueTokens.length === tokens.length);
            
            const store = useUserStore.getState();
            
            // 创建订阅者
            const subscriberUpdates: any[] = [];
            
            const unsubscribe = useUserStore.subscribe((state) => {
              subscriberUpdates.push({ token: state.token });
            });
            
            const initialCount = subscriberUpdates.length;
            
            // 多次更新状态
            tokens.forEach(token => {
              store.setToken(token);
            });
            
            // 验证收到了相应次数的通知
            const updateCount = subscriberUpdates.length - initialCount;
            expect(updateCount).toBe(tokens.length);
            
            // 验证每次更新的值都正确
            for (let i = 0; i < tokens.length; i++) {
              const update = subscriberUpdates[initialCount + i];
              expect(update.token).toBe(tokens[i]);
            }
            
            // 取消订阅
            unsubscribe();
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 55: 状态持久化恢复
   * Validates: Requirements 11.4
   * 
   * 对于任意页面刷新，系统应该从本地存储恢复必要的全局状态
   * 验证Zustand的persist中间件能够正确保存和恢复状态
   */
  describe('Property 55: 状态持久化恢复', () => {
    it('用户状态应该持久化到localStorage', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置用户状态
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证状态已保存到localStorage
            const storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证localStorage中包含正确的状态数据
              expect(parsed.state).toBeDefined();
              expect(parsed.state.token).toBe(token);
              expect(parsed.state.userInfo).toEqual(userInfo);
            }
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('权限状态应该持久化到localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
          fc.record({
            id: fc.uuid(),
            name: fc.constantFrom('管理员', '普通用户', '访客', '编辑者'),
            code: fc.constantFrom('admin', 'user', 'guest', 'editor'),
            permissions: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
            description: fc.option(fc.string({ minLength: 10, maxLength: 50 }), { nil: undefined }),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (permissions, role) => {
            const store = usePermissionStore.getState();
            
            // 设置权限状态
            store.setRole(role);
            
            // 验证状态已保存到localStorage
            const storedData = localStorage.getItem('permission-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证localStorage中包含正确的权限数据
              expect(parsed.state).toBeDefined();
              expect(parsed.state.permissions).toEqual(role.permissions);
              expect(parsed.state.role).toEqual(role);
            }
            
            // 清理
            store.clearPermissions();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('应用状态应该持久化到localStorage', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('light' as const, 'dark' as const),
          (collapsed, theme) => {
            const store = useAppStore.getState();
            
            // 设置应用状态
            store.setCollapsed(collapsed);
            store.setTheme(theme);
            
            // 验证状态已保存到localStorage
            const storedData = localStorage.getItem('app-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证localStorage中包含正确的应用状态
              expect(parsed.state).toBeDefined();
              expect(parsed.state.collapsed).toBe(collapsed);
              expect(parsed.state.theme).toBe(theme);
              // loading不应该被持久化（根据partialize配置）
              expect(parsed.state.loading).toBeUndefined();
            }
            
            // 清理
            store.setCollapsed(false);
            store.setTheme('light');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('清除localStorage后状态应该恢复为初始值', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置用户状态
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证状态已设置
            let currentState = useUserStore.getState();
            expect(currentState.token).toBe(token);
            expect(currentState.userInfo).toEqual(userInfo);
            
            // 清除用户状态（这会清除localStorage）
            store.clearUser();
            
            // 验证状态已恢复为初始值
            currentState = useUserStore.getState();
            expect(currentState.token).toBeNull();
            expect(currentState.userInfo).toBeNull();
            
            // 验证localStorage已清除
            const storedData = localStorage.getItem('user-storage');
            if (storedData) {
              const parsed = JSON.parse(storedData);
              expect(parsed.state.token).toBeNull();
              expect(parsed.state.userInfo).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('只有partialize指定的字段应该被持久化', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('light' as const, 'dark' as const),
          fc.boolean(),
          (collapsed, theme, loading) => {
            const store = useAppStore.getState();
            
            // 设置所有应用状态
            store.setCollapsed(collapsed);
            store.setTheme(theme);
            store.setLoading(loading);
            
            // 验证内存中的状态
            const memoryState = useAppStore.getState();
            expect(memoryState.collapsed).toBe(collapsed);
            expect(memoryState.theme).toBe(theme);
            expect(memoryState.loading).toBe(loading);
            
            // 验证localStorage中的状态
            const storedData = localStorage.getItem('app-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证只有collapsed和theme被持久化
              expect(parsed.state.collapsed).toBe(collapsed);
              expect(parsed.state.theme).toBe(theme);
              // loading不应该被持久化
              expect(parsed.state.loading).toBeUndefined();
            }
            
            // 清理
            store.setCollapsed(false);
            store.setTheme('light');
            store.setLoading(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('状态更新应该立即同步到localStorage', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
          (tokens) => {
            // 确保所有token都不同
            const uniqueTokens = Array.from(new Set(tokens));
            fc.pre(uniqueTokens.length === tokens.length);
            
            const store = useUserStore.getState();
            
            // 依次更新token并验证localStorage
            tokens.forEach(token => {
              store.setToken(token);
              
              // 验证localStorage立即更新
              const storedData = localStorage.getItem('user-storage');
              expect(storedData).not.toBeNull();
              
              if (storedData) {
                const parsed = JSON.parse(storedData);
                expect(parsed.state.token).toBe(token);
              }
            });
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('多个store的持久化应该相互独立', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          fc.boolean(),
          (token, permissions, collapsed) => {
            const userStore = useUserStore.getState();
            const permissionStore = usePermissionStore.getState();
            const appStore = useAppStore.getState();
            
            // 设置各个store的状态
            userStore.setToken(token);
            permissionStore.setPermissions(permissions);
            appStore.setCollapsed(collapsed);
            
            // 验证各个store的localStorage是独立的
            const userData = localStorage.getItem('user-storage');
            const permissionData = localStorage.getItem('permission-storage');
            const appData = localStorage.getItem('app-storage');
            
            expect(userData).not.toBeNull();
            expect(permissionData).not.toBeNull();
            expect(appData).not.toBeNull();
            
            // 验证每个store只包含自己的数据
            if (userData) {
              const parsed = JSON.parse(userData);
              expect(parsed.state.token).toBe(token);
              expect(parsed.state.permissions).toBeUndefined();
              expect(parsed.state.collapsed).toBeUndefined();
            }
            
            if (permissionData) {
              const parsed = JSON.parse(permissionData);
              expect(parsed.state.permissions).toEqual(permissions);
              expect(parsed.state.token).toBeUndefined();
              expect(parsed.state.collapsed).toBeUndefined();
            }
            
            if (appData) {
              const parsed = JSON.parse(appData);
              expect(parsed.state.collapsed).toBe(collapsed);
              expect(parsed.state.token).toBeUndefined();
              expect(parsed.state.permissions).toBeUndefined();
            }
            
            // 清理
            userStore.clearUser();
            permissionStore.clearPermissions();
            appStore.setCollapsed(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 56: 状态中间件执行
   * Validates: Requirements 11.5
   * 
   * 对于任意状态变更，系统应该按顺序执行所有注册的中间件
   * 验证persist中间件在状态变更时正确执行
   */
  describe('Property 56: 状态中间件执行', () => {
    it('persist中间件应该在状态变更时执行', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          (token) => {
            const store = useUserStore.getState();
            
            // 清除localStorage以确保干净的状态
            localStorage.removeItem('user-storage');
            
            // 验证localStorage初始为空
            let storedData = localStorage.getItem('user-storage');
            expect(storedData).toBeNull();
            
            // 更新状态
            store.setToken(token);
            
            // 验证persist中间件已执行并保存到localStorage
            storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              expect(parsed.state.token).toBe(token);
            }
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('中间件应该在每次状态变更时都执行', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 2, maxLength: 5 }),
          (tokens) => {
            // 确保所有token都不同
            const uniqueTokens = Array.from(new Set(tokens));
            fc.pre(uniqueTokens.length === tokens.length);
            
            const store = useUserStore.getState();
            
            // 依次更新状态并验证中间件执行
            tokens.forEach(token => {
              store.setToken(token);
              
              // 验证persist中间件在每次变更时都执行
              const storedData = localStorage.getItem('user-storage');
              expect(storedData).not.toBeNull();
              
              if (storedData) {
                const parsed = JSON.parse(storedData);
                // 验证localStorage中的值与当前状态一致
                expect(parsed.state.token).toBe(token);
              }
            });
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('中间件应该处理复杂状态对象', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置复杂状态
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证persist中间件正确处理复杂对象
            const storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证复杂对象被正确序列化和存储
              expect(parsed.state.token).toBe(token);
              expect(parsed.state.userInfo).toEqual(userInfo);
              expect(parsed.state.userInfo.id).toBe(userInfo.id);
              expect(parsed.state.userInfo.username).toBe(userInfo.username);
              expect(parsed.state.userInfo.email).toBe(userInfo.email);
            }
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('中间件应该正确处理partialize配置', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.constantFrom('light' as const, 'dark' as const),
          fc.boolean(),
          (collapsed, theme, loading) => {
            const store = useAppStore.getState();
            
            // 设置所有状态
            store.setCollapsed(collapsed);
            store.setTheme(theme);
            store.setLoading(loading);
            
            // 验证persist中间件遵守partialize配置
            const storedData = localStorage.getItem('app-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              
              // 验证只有partialize指定的字段被持久化
              expect(parsed.state.collapsed).toBe(collapsed);
              expect(parsed.state.theme).toBe(theme);
              // loading不在partialize中，不应该被持久化
              expect(parsed.state.loading).toBeUndefined();
            }
            
            // 清理
            store.setCollapsed(false);
            store.setTheme('light');
            store.setLoading(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('中间件应该在清除状态时执行', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          fc.record({
            id: fc.uuid(),
            username: fc.string({ minLength: 3, maxLength: 20 }),
            nickname: fc.string({ minLength: 2, maxLength: 30 }),
            avatar: fc.option(fc.webUrl(), { nil: undefined }),
            email: fc.option(fc.emailAddress(), { nil: undefined }),
            phone: fc.option(
              fc.string({ minLength: 11, maxLength: 11 }).map(s => '1' + s.slice(1)),
              { nil: undefined }
            ),
            roleId: fc.uuid(),
            roleName: fc.constantFrom('管理员', '普通用户', '访客'),
            status: fc.constantFrom(UserStatus.ENABLED, UserStatus.DISABLED),
            createTime: validISODate(),
            updateTime: validISODate(),
          }),
          (token, userInfo) => {
            const store = useUserStore.getState();
            
            // 设置状态
            store.setToken(token);
            store.setUserInfo(userInfo);
            
            // 验证状态已保存
            let storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            // 清除状态
            store.clearUser();
            
            // 验证persist中间件在清除时也执行
            storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              // 验证localStorage中的状态已被清除
              expect(parsed.state.token).toBeNull();
              expect(parsed.state.userInfo).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('多个中间件应该协同工作', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 20, maxLength: 100 }),
          (token) => {
            const store = useUserStore.getState();
            
            // 创建订阅者来验证订阅机制（另一个中间件功能）
            const updates: unknown[] = [];
            const unsubscribe = useUserStore.subscribe((state) => {
              updates.push({ token: state.token });
            });
            
            const initialCount = updates.length;
            
            // 更新状态
            store.setToken(token);
            
            // 验证订阅机制工作（中间件1）
            expect(updates.length).toBeGreaterThan(initialCount);
            expect(updates[updates.length - 1].token).toBe(token);
            
            // 验证persist中间件工作（中间件2）
            const storedData = localStorage.getItem('user-storage');
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              expect(parsed.state.token).toBe(token);
            }
            
            // 取消订阅
            unsubscribe();
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('中间件应该保持状态一致性', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 20, maxLength: 100 }), { minLength: 3, maxLength: 5 }),
          (tokens) => {
            // 确保所有token都不同
            const uniqueTokens = Array.from(new Set(tokens));
            fc.pre(uniqueTokens.length === tokens.length);
            
            const store = useUserStore.getState();
            
            // 快速连续更新状态
            tokens.forEach(token => {
              store.setToken(token);
            });
            
            // 验证最终状态一致性
            const memoryState = useUserStore.getState();
            const storedData = localStorage.getItem('user-storage');
            
            expect(storedData).not.toBeNull();
            
            if (storedData) {
              const parsed = JSON.parse(storedData);
              // 验证内存状态和持久化状态一致
              expect(parsed.state.token).toBe(memoryState.token);
              expect(parsed.state.token).toBe(tokens[tokens.length - 1]);
            }
            
            // 清理
            store.clearUser();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
