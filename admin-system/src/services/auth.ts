/**
 * 认证服务
 */
import { post, get } from '@/utils/request';
import type { LoginParams, LoginResult, User } from '@/types';
import { setToken, removeToken, isTokenExpired } from '@/utils/storage';
import { useUserStore, usePermissionStore } from '@/store';

/**
 * 用户登录
 */
export async function login(params: LoginParams): Promise<LoginResult> {
  const result = await post<LoginResult>('/api/auth/login', params);
  
  // 保存token和用户信息
  if (result.token) {
    setToken(result.token);
    useUserStore.getState().setToken(result.token);
    useUserStore.getState().setUserInfo(result.userInfo);
    usePermissionStore.getState().setPermissions(result.permissions);
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
    useUserStore.getState().clearUser();
    usePermissionStore.getState().clearPermissions();
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfo(): Promise<User> {
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
