/**
 * 认证Hook
 */
import { useUserStore } from '@/store';
import { checkLoginStatus } from '@/services/auth';

export function useAuth() {
  const { token, userInfo, setToken, setUserInfo, clearUser } = useUserStore();

  return {
    // 状态
    token,
    userInfo,
    isAuthenticated: checkLoginStatus(),
    
    // 方法
    setToken,
    setUserInfo,
    clearUser,
  };
}
