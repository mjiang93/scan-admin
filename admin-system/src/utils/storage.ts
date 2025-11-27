/**
 * 本地存储工具
 */
import { getConfig } from '@/config';

/**
 * 存储数据（支持JSON序列化）
 */
export function setStorage<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error('Failed to set storage:', error);
  }
}

/**
 * 获取数据（自动反序列化）
 */
export function getStorage<T>(key: string): T | null {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return null;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('Failed to get storage:', error);
    return null;
  }
}

/**
 * 移除数据
 */
export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove storage:', error);
  }
}

/**
 * 清空所有数据
 */
export function clearStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
}

/**
 * 存储Token
 */
export function setToken(token: string, expires?: number): void {
  const tokenKey = getConfig('token').key;
  const expiresKey = getConfig('token').expiresKey;
  
  setStorage(tokenKey, token);
  
  if (expires) {
    setStorage(expiresKey, expires);
  }
}

/**
 * 获取Token
 */
export function getToken(): string | null {
  const tokenKey = getConfig('token').key;
  return getStorage<string>(tokenKey);
}

/**
 * 移除Token
 */
export function removeToken(): void {
  const tokenKey = getConfig('token').key;
  const expiresKey = getConfig('token').expiresKey;
  
  removeStorage(tokenKey);
  removeStorage(expiresKey);
}

/**
 * 检查Token是否过期
 */
export function isTokenExpired(): boolean {
  const expiresKey = getConfig('token').expiresKey;
  const expires = getStorage<number>(expiresKey);
  
  if (!expires) {
    return false;
  }
  
  return Date.now() > expires;
}

/**
 * 存储用户信息
 */
export function setUserInfo(userInfo: any): void {
  setStorage('userInfo', userInfo);
}

/**
 * 获取用户信息
 */
export function getUserInfo<T = any>(): T | null {
  return getStorage<T>('userInfo');
}

/**
 * 移除用户信息
 */
export function removeUserInfo(): void {
  removeStorage('userInfo');
}

/**
 * 清除所有认证信息
 */
export function clearAuth(): void {
  removeToken();
  removeUserInfo();
}
