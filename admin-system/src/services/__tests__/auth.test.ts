/**
 * 认证服务属性测试
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { login, logout, getUserInfo, checkLoginStatus, validateToken } from '../auth';
import { setToken, removeToken, getToken, setUserInfo, removeUserInfo } from '@/utils/storage';
import { useUserStore, usePermissionStore } from '@/store';
import type { LoginParams, LoginResult, User } from '@/types';
import { UserStatus } from '@/types';

// Mock request module
vi.mock('@/utils/request', () => ({
  post: vi.fn(),
  get: vi.fn(),
}));

import { post, get } from '@/utils/request';

describe('认证服务属性测试', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
    
    // 重置所有mock
    vi.clearAllMocks();
    
    // 清理store状态
    useUserStore.getState().clearUser();
    usePermissionStore.getState().clearPermissions();
  });

  // **Feature: admin-management-system, Property 1: 登录凭据验证一致性**
  describe('Property 1: 登录凭据验证一致性', () => {
    test('对于任意用户凭据，调用登录验证函数应返回一致的认证结果', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            password: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          async (credentials: LoginParams) => {
            // Mock相同的响应
            const mockResponse: LoginResult = {
              token: 'test-token-' + credentials.username,
              userInfo: {
                id: '1',
                username: credentials.username,
                nickname: credentials.username,
                roleId: 'role1',
                roleName: 'User',
                status: UserStatus.ENABLED,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
              },
              permissions: ['read'],
            };

            vi.mocked(post).mockResolvedValue(mockResponse);

            // 第一次调用
            const result1 = await login(credentials);
            
            // 清理状态
            localStorage.clear();
            useUserStore.getState().clearUser();
            usePermissionStore.getState().clearPermissions();
            vi.clearAllMocks();
            
            // Mock相同的响应
            vi.mocked(post).mockResolvedValue(mockResponse);
            
            // 第二次调用
            const result2 = await login(credentials);

            // 验证两次调用返回一致的结果
            expect(result1.token).toBe(result2.token);
            expect(result1.userInfo.username).toBe(result2.userInfo.username);
            expect(result1.permissions).toEqual(result2.permissions);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 2: Token存储完整性**
  describe('Property 2: Token存储完整性', () => {
    test('对于任意成功的用户认证，Token应该正确存储并可以被读取和验证', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            token: fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          async ({ token, username }) => {
            const mockResponse: LoginResult = {
              token,
              userInfo: {
                id: '1',
                username,
                nickname: username,
                roleId: 'role1',
                roleName: 'User',
                status: UserStatus.ENABLED,
                createTime: new Date().toISOString(),
                updateTime: new Date().toISOString(),
              },
              permissions: ['read'],
            };

            vi.mocked(post).mockResolvedValue(mockResponse);

            // 执行登录
            await login({ username, password: 'password' });

            // 验证Token已存储
            const storedToken = getToken();
            expect(storedToken).toBe(token);

            // 验证Token可以被验证
            expect(validateToken(storedToken!)).toBe(true);

            // 验证store中也有Token
            expect(useUserStore.getState().token).toBe(token);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 3: 认证失败错误处理**
  describe('Property 3: 认证失败错误处理', () => {
    test('对于任意无效的用户凭据，系统应该抛出错误且不进行Token存储', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            password: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          }),
          async (credentials: LoginParams) => {
            // Mock失败响应
            const error = new Error('认证失败');
            vi.mocked(post).mockRejectedValue(error);

            // 验证登录失败会抛出错误
            await expect(login(credentials)).rejects.toThrow();

            // 验证没有存储Token
            const storedToken = getToken();
            expect(storedToken).toBeNull();

            // 验证store中没有Token
            expect(useUserStore.getState().token).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 4: Token过期清理**
  describe('Property 4: Token过期清理', () => {
    test('对于任意过期的Token，检测到过期时应该清除本地存储', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
          (token: string) => {
            // 设置一个已过期的Token（过期时间设为过去）
            const expiredTime = Date.now() - 1000; // 1秒前过期
            setToken(token, expiredTime);
            
            // 设置用户信息到store
            useUserStore.getState().setToken(token);

            // 检查登录状态（应该检测到过期）
            const isLoggedIn = checkLoginStatus();

            // 验证返回false
            expect(isLoggedIn).toBe(false);

            // 验证store中的token已被清除
            expect(useUserStore.getState().token).toBeNull();
            expect(useUserStore.getState().userInfo).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: admin-management-system, Property 5: 登出状态清理**
  describe('Property 5: 登出状态清理', () => {
    test('对于任意已登录用户，执行登出后应该清除所有用户相关数据', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            token: fc.string({ minLength: 10, maxLength: 100 }).filter(s => s.trim().length > 0),
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            permissions: fc.array(fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), { minLength: 1, maxLength: 10 }),
          }),
          async ({ token, username, permissions }) => {
            // 设置登录状态
            setToken(token);
            const userInfo: User = {
              id: '1',
              username,
              nickname: username,
              roleId: 'role1',
              roleName: 'User',
              status: UserStatus.ENABLED,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
            };
            setUserInfo(userInfo);
            useUserStore.getState().setToken(token);
            useUserStore.getState().setUserInfo(userInfo);
            usePermissionStore.getState().setPermissions(permissions);

            // Mock logout API
            vi.mocked(post).mockResolvedValue({});

            // 执行登出
            await logout();

            // 验证Token已清除
            expect(getToken()).toBeNull();

            // 验证store中的数据已清除
            expect(useUserStore.getState().token).toBeNull();
            expect(useUserStore.getState().userInfo).toBeNull();
            expect(usePermissionStore.getState().permissions).toEqual([]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
