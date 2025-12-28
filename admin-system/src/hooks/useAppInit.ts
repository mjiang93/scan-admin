/**
 * 应用初始化Hook
 * 用于在应用启动时恢复用户状态
 */
import { useEffect } from 'react';
import { useUserStore } from '@/store';
import { getToken, getUserInfo } from '@/utils/storage';
import { getCachedUserInfo } from '@/services/auth';

export function useAppInit() {
  const { setToken, setUserInfo } = useUserStore();

  useEffect(() => {
    // 恢复token
    const token = getToken();
    if (token) {
      setToken(token);
    }

    // 恢复用户信息
    const userInfo = getUserInfo() || getCachedUserInfo();
    if (userInfo) {
      setUserInfo(userInfo);
    }

    console.log('应用初始化完成:', { token: !!token, userInfo: !!userInfo });
  }, [setToken, setUserInfo]);
}