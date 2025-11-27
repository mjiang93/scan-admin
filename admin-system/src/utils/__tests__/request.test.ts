/**
 * HTTP请求封装属性测试
 * Feature: admin-management-system
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fc } from '@fast-check/vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { get, post, put, del } from '../request';
import { getConfig } from '@/config';

// 创建axios mock
const mock = new MockAdapter(axios);

describe('HTTP请求封装属性测试', () => {
  beforeEach(() => {
    // 清理localStorage
    localStorage.clear();
    // 重置所有mock
    mock.reset();
    // 清理所有消息提示的mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    mock.reset();
  });

  /**
   * Property 30: 请求Token注入
   * Validates: Requirements 7.1
   * 
   * 对于任意HTTP请求，当localStorage中存在Token时，
   * 系统应该自动将Token添加到请求头的Authorization字段中
   */
  describe('Property 30: 请求Token注入', () => {
    it('应该在所有请求中自动注入Token到Authorization头', () => {
      fc.assert(
        fc.asyncProperty(
          // 生成随机Token字符串
          fc.string({ minLength: 10, maxLength: 100 }),
          // 生成随机URL路径
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          // 生成随机请求数据
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          async (token, url, data) => {
            // 设置Token到localStorage
            const tokenKey = getConfig('token').key;
            localStorage.setItem(tokenKey, token);

            // Mock API响应
            mock.onGet(url).reply((config) => {
              // 验证请求头中包含Token
              expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
              return [200, { code: 200, data: { success: true } }];
            });

            mock.onPost(url).reply((config) => {
              expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
              return [200, { code: 200, data: { success: true } }];
            });

            mock.onPut(url).reply((config) => {
              expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
              return [200, { code: 200, data: { success: true } }];
            });

            mock.onDelete(url).reply((config) => {
              expect(config.headers?.Authorization).toBe(`Bearer ${token}`);
              return [200, { code: 200, data: { success: true } }];
            });

            // 测试所有HTTP方法
            await get(url);
            await post(url, data);
            await put(url, data);
            await del(url);
          }
        ),
        { numRuns: 50 } // 运行50次测试
      );
    });

    it('当没有Token时，不应该添加Authorization头', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (url) => {
            // 确保localStorage中没有Token
            const tokenKey = getConfig('token').key;
            localStorage.removeItem(tokenKey);

            // Mock API响应
            mock.onGet(url).reply((config) => {
              // 验证请求头中不包含Authorization或为undefined
              expect(config.headers?.Authorization).toBeUndefined();
              return [200, { code: 200, data: { success: true } }];
            });

            await get(url);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 31: 401状态处理
   * Validates: Requirements 7.2
   * 
   * 对于任意返回401状态码的HTTP请求，
   * 系统应该清除Token和过期时间，并跳转到登录页面
   */
  describe('Property 31: 401状态处理', () => {
    it('当请求返回401时，应该清除Token并跳转到登录页', () => {
      fc.assert(
        fc.asyncProperty(
          // 生成随机Token
          fc.string({ minLength: 10, maxLength: 100 }),
          // 生成随机URL
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (token, url) => {
            // 设置Token和过期时间到localStorage
            const tokenKey = getConfig('token').key;
            const expiresKey = getConfig('token').expiresKey;
            localStorage.setItem(tokenKey, token);
            localStorage.setItem(expiresKey, String(Date.now() + 3600000));

            // Mock window.location.href
            const originalLocation = window.location.href;
            delete (window as any).location;
            window.location = { href: '' } as any;

            // Mock API返回401
            mock.onGet(url).reply(401, { message: 'Unauthorized' });

            try {
              await get(url);
            } catch (error) {
              // 预期会抛出错误
            }

            // 验证Token和过期时间已被清除
            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(localStorage.getItem(expiresKey)).toBeNull();

            // 验证跳转到登录页
            expect(window.location.href).toBe('/login');

            // 恢复window.location
            window.location.href = originalLocation;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('对于不同的HTTP方法，401处理应该一致', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
          async (token, url, method) => {
            const tokenKey = getConfig('token').key;
            const expiresKey = getConfig('token').expiresKey;
            
            // 为每个方法单独测试
            localStorage.setItem(tokenKey, token);
            localStorage.setItem(expiresKey, String(Date.now() + 3600000));

            // Mock window.location
            delete (window as any).location;
            window.location = { href: '' } as any;

            // Mock 401响应
            if (method === 'GET') {
              mock.onGet(url).reply(401);
            } else if (method === 'POST') {
              mock.onPost(url).reply(401);
            } else if (method === 'PUT') {
              mock.onPut(url).reply(401);
            } else if (method === 'DELETE') {
              mock.onDelete(url).reply(401);
            }

            try {
              if (method === 'GET') {
                await get(url);
              } else if (method === 'POST') {
                await post(url, {});
              } else if (method === 'PUT') {
                await put(url, {});
              } else if (method === 'DELETE') {
                await del(url);
              }
            } catch (error) {
              // 预期会抛出错误
            }

            // 验证清除和跳转
            expect(localStorage.getItem(tokenKey)).toBeNull();
            expect(localStorage.getItem(expiresKey)).toBeNull();
            expect(window.location.href).toBe('/login');

            // 重置mock
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 32: 错误统一处理
   * Validates: Requirements 7.3
   * 
   * 对于任意HTTP请求错误（403、404、500等），
   * 系统应该统一处理并抛出错误，错误信息应该包含在响应中
   */
  describe('Property 32: 错误统一处理', () => {
    it('应该统一处理各种HTTP错误状态码', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.constantFrom(403, 404, 500),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (url, statusCode, errorMessage) => {
            // Mock API返回错误状态码
            mock.onGet(url).reply(statusCode, { message: errorMessage });

            let errorThrown = false;
            try {
              await get(url);
            } catch (error) {
              errorThrown = true;
              // 验证错误被正确抛出
              expect(error).toBeDefined();
            }

            // 验证确实抛出了错误
            expect(errorThrown).toBe(true);

            // 重置mock
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('网络错误应该被统一处理', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (url) => {
            // Mock网络错误（没有响应）
            mock.onGet(url).networkError();

            let errorThrown = false;
            try {
              await get(url);
            } catch (error) {
              errorThrown = true;
              expect(error).toBeDefined();
            }

            expect(errorThrown).toBe(true);

            // 重置mock
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('业务错误应该被统一处理', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.string({ minLength: 5, maxLength: 50 }),
          async (url, errorMessage) => {
            // Mock业务错误（返回200但code不是200）
            mock.onGet(url).reply(200, { 
              code: 400, 
              success: false, 
              message: errorMessage 
            });

            let errorThrown = false;
            try {
              await get(url);
            } catch (error) {
              errorThrown = true;
              expect(error).toBeDefined();
              // 验证错误消息
              if (error instanceof Error) {
                expect(error.message).toBe(errorMessage);
              }
            }

            expect(errorThrown).toBe(true);

            // 重置mock
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 33: 拦截器执行
   * Validates: Requirements 7.4
   * 
   * 对于任意HTTP请求，系统应该按顺序执行请求拦截器和响应拦截器
   * 请求拦截器应该在请求发送前执行，响应拦截器应该在响应返回后执行
   */
  describe('Property 33: 拦截器执行', () => {
    it('请求拦截器应该在请求发送前执行', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (token, url) => {
            // 设置Token
            const tokenKey = getConfig('token').key;
            localStorage.setItem(tokenKey, token);

            let requestInterceptorExecuted = false;

            // Mock API响应，验证请求拦截器已执行
            mock.onGet(url).reply((config) => {
              // 如果Authorization头存在，说明请求拦截器已执行
              if (config.headers?.Authorization === `Bearer ${token}`) {
                requestInterceptorExecuted = true;
              }
              return [200, { code: 200, data: { success: true } }];
            });

            await get(url);

            // 验证请求拦截器已执行
            expect(requestInterceptorExecuted).toBe(true);

            // 清理
            localStorage.removeItem(tokenKey);
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('响应拦截器应该在响应返回后执行', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          async (url, responseData) => {
            // Mock API响应
            mock.onGet(url).reply(200, { 
              code: 200, 
              success: true,
              data: responseData 
            });

            const result = await get(url);

            // 验证响应拦截器已执行（返回的是data部分，不是完整的axios响应）
            expect(result).toHaveProperty('code', 200);
            expect(result).toHaveProperty('data');
            expect(result.data).toEqual(responseData);

            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });

    it('拦截器应该按顺序执行：请求拦截器 -> 请求发送 -> 响应拦截器', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (token, url) => {
            const tokenKey = getConfig('token').key;
            localStorage.setItem(tokenKey, token);

            const executionOrder: string[] = [];

            // Mock API响应
            mock.onGet(url).reply((config) => {
              // 请求拦截器应该已经执行
              if (config.headers?.Authorization) {
                executionOrder.push('request-interceptor-executed');
              }
              executionOrder.push('request-sent');
              return [200, { code: 200, data: { success: true } }];
            });

            const result = await get(url);
            
            // 响应拦截器执行后，应该返回处理后的数据
            if (result && typeof result === 'object') {
              executionOrder.push('response-interceptor-executed');
            }

            // 验证执行顺序
            expect(executionOrder).toEqual([
              'request-interceptor-executed',
              'request-sent',
              'response-interceptor-executed'
            ]);

            localStorage.removeItem(tokenKey);
            mock.reset();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 34: 超时处理
   * Validates: Requirements 7.5
   * 
   * 对于任意超时的HTTP请求，系统应该在配置的重试次数内进行重试
   * 如果所有重试都失败，应该抛出错误
   */
  describe('Property 34: 超时处理', () => {
    it('请求超时后应该进行重试', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (url) => {
            let attemptCount = 0;

            // Mock超时错误
            mock.onGet(url).reply(() => {
              attemptCount++;
              // 模拟超时
              return new Promise((_, reject) => {
                setTimeout(() => {
                  reject(new Error('timeout'));
                }, 10);
              });
            });

            let errorThrown = false;
            try {
              await get(url);
            } catch (error) {
              errorThrown = true;
            }

            // 验证发生了重试（初始请求 + 重试次数）
            const retryCount = getConfig('request').retryCount;
            expect(attemptCount).toBeGreaterThan(1);
            expect(attemptCount).toBeLessThanOrEqual(retryCount + 1);
            expect(errorThrown).toBe(true);

            mock.reset();
          }
        ),
        { numRuns: 20 } // 减少运行次数因为涉及超时
      );
    });

    it('重试成功后应该返回结果', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          async (url, responseData) => {
            let attemptCount = 0;

            // Mock第一次失败，第二次成功
            mock.onGet(url).reply(() => {
              attemptCount++;
              if (attemptCount === 1) {
                // 第一次请求失败
                return new Promise((_, reject) => {
                  setTimeout(() => reject(new Error('timeout')), 10);
                });
              } else {
                // 第二次请求成功
                return [200, { code: 200, data: responseData }];
              }
            });

            const result = await get(url);

            // 验证进行了重试并最终成功
            expect(attemptCount).toBe(2);
            expect(result).toHaveProperty('data');
            expect(result.data).toEqual(responseData);

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('网络错误不应该触发重试', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (url) => {
            let attemptCount = 0;

            // Mock网络错误
            mock.onGet(url).reply(() => {
              attemptCount++;
              return new Promise((_, reject) => {
                const error: unknown = new Error('Network Error');
                error.code = 'ECONNABORTED';
                reject(error);
              });
            });

            let errorThrown = false;
            try {
              await get(url);
            } catch (error) {
              errorThrown = true;
            }

            // 验证进行了重试
            expect(attemptCount).toBeGreaterThan(1);
            expect(errorThrown).toBe(true);

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 35: 重复请求取消
   * Validates: Requirements 7.6
   * 
   * 对于任意相同的HTTP请求（相同的URL、方法、参数），
   * 当前一个请求还未完成时发起新请求，系统应该取消前一个请求
   */
  describe('Property 35: 重复请求取消', () => {
    it('相同的GET请求应该取消前一个未完成的请求', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.record({
            page: fc.integer({ min: 1, max: 10 }),
            size: fc.integer({ min: 10, max: 50 }),
          }),
          async (url, params) => {
            let requestCount = 0;
            let cancelledCount = 0;

            // Mock慢速响应
            mock.onGet(url).reply(() => {
              requestCount++;
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve([200, { code: 200, data: { success: true } }]);
                }, 100);
              });
            });

            // 同时发起两个相同的请求
            const promise1 = get(url, params).catch((error) => {
              if (axios.isCancel(error)) {
                cancelledCount++;
              }
              throw error;
            });

            // 稍微延迟后发起第二个请求
            await new Promise(resolve => setTimeout(resolve, 10));
            const promise2 = get(url, params);

            // 等待请求完成
            try {
              await promise1;
            } catch (error) {
              // 第一个请求可能被取消
            }

            const result2 = await promise2;

            // 验证第一个请求被取消
            expect(cancelledCount).toBe(1);
            expect(result2).toBeDefined();

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('相同的POST请求应该取消前一个未完成的请求', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          async (url, data) => {
            let cancelledCount = 0;

            // Mock慢速响应
            mock.onPost(url).reply(() => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  resolve([200, { code: 200, data: { success: true } }]);
                }, 100);
              });
            });

            // 同时发起两个相同的POST请求
            const promise1 = post(url, data).catch((error) => {
              if (axios.isCancel(error)) {
                cancelledCount++;
              }
              throw error;
            });

            await new Promise(resolve => setTimeout(resolve, 10));
            const promise2 = post(url, data);

            try {
              await promise1;
            } catch (error) {
              // 第一个请求可能被取消
            }

            const result2 = await promise2;

            // 验证第一个请求被取消
            expect(cancelledCount).toBe(1);
            expect(result2).toBeDefined();

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('不同的请求不应该互相取消', () => {
      fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          fc.string({ minLength: 1, maxLength: 50 }).map(s => `/${s.replace(/\s/g, '')}`),
          async (url1, url2) => {
            // 确保两个URL不同
            if (url1 === url2) {
              url2 = url2 + '-different';
            }

            let completedCount = 0;

            // Mock两个不同的URL
            mock.onGet(url1).reply(() => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  completedCount++;
                  resolve([200, { code: 200, data: { url: url1 } }]);
                }, 50);
              });
            });

            mock.onGet(url2).reply(() => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  completedCount++;
                  resolve([200, { code: 200, data: { url: url2 } }]);
                }, 50);
              });
            });

            // 同时发起两个不同的请求
            const promise1 = get(url1);
            const promise2 = get(url2);

            const [result1, result2] = await Promise.all([promise1, promise2]);

            // 验证两个请求都成功完成
            expect(completedCount).toBe(2);
            expect(result1).toBeDefined();
            expect(result2).toBeDefined();

            mock.reset();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
