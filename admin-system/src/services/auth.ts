/**
 * 认证服务
 */
import { post, get } from '@/utils/request';
import type { LoginParams, LoginResult, User, LoginData } from '@/types';
import { setToken, removeToken, isTokenExpired } from '@/utils/storage';
import { useUserStore, usePermissionStore } from '@/store';

/**
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResult> {
  // 只调用一次接口，不进行重复调用
  const result = await post<LoginResult>('/user/login', params);
  
  // 只有当 code === 0 时才算成功，其他情况由统一的接口封装处理
  if (result.code === 0 && result.data) {
    const { token, userId, userName, status } = result.data;
    
    // 保存token到localStorage
    if (token) {
      setToken(token);
      useUserStore.getState().setToken(token);
      
      // 构造用户信息对象
      const userInfo: User = {
        userId,
        userName,
        status,
      };
      
      // 保存用户信息
      useUserStore.getState().setUserInfo(userInfo);
      
      // 缓存登录数据到localStorage
      localStorage.setItem('loginData', JSON.stringify(result.data));
      
      console.log('登录成功，用户信息已保存:', userInfo);
      console.log('Token已保存:', token);
    }
  }
  
  return result;
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await post('/api/auth/logout');
  } finally {
    // 清除本地数据
    removeToken();
    localStorage.removeItem('loginData');
    useUserStore.getState().clearUser();
    usePermissionStore.getState().clearPermissions();
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<User> {
  // 先尝试从localStorage获取缓存的用户信息
  const cachedLoginData = localStorage.getItem('loginData');
  if (cachedLoginData) {
    try {
      const loginData: LoginData = JSON.parse(cachedLoginData);
      const userInfo: User = {
        userId: loginData.userId,
        userName: loginData.userName,
        status: loginData.status,
      };
      
      // 更新store
      useUserStore.getState().setUserInfo(userInfo);
      return userInfo;
    } catch (error) {
      console.error('解析缓存用户信息失败:', error);
    }
  }
  
  // 如果没有缓存或解析失败，从API获取
  const result = await get<{ userInfo: User; permissions: string[] }>('/api/auth/userInfo');
  
  // 更新store
  useUserStore.getState().setUserInfo(result.userInfo);
  usePermissionStore.getState().setPermissions(result.permissions);
  
  return result.userInfo;
}

/**
 * 检查登录状态
 */
export function checkLoginStatus(): boolean {
  const token = useUserStore.getState().token;
  
  if (!token) {
    return false;
  }
  
  // 检查token是否过期
  if (isTokenExpired()) {
    useUserStore.getState().clearUser();
    return false;
  }
  
  return true;
}

/**
 * Token验证
 */
export function validateToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  // 简单验证token格式（实际应该根据具体token格式验证）
  return token.length > 0;
}

/**
 * 获取缓存的token
 */
export function getCachedToken(): string | null {
  return localStorage.getItem('admin_token');
}

/**
 * 获取缓存的用户信息
 */
export function getCachedUserInfo(): User | null {
  const cachedLoginData = localStorage.getItem('loginData');
  if (cachedLoginData) {
    try {
      const loginData: LoginData = JSON.parse(cachedLoginData);
      return {
        userId: loginData.userId,
        userName: loginData.userName,
        status: loginData.status,
      };
    } catch (error) {
      console.error('解析缓存用户信息失败:', error);
      return null;
    }
  }
  return null;
}
