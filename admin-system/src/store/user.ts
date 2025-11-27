/**
 * 用户状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { setToken, removeToken, setUserInfo, removeUserInfo } from '@/utils/storage';

interface UserState {
  token: string | null;
  userInfo: User | null;
  setToken: (token: string) => void;
  setUserInfo: (userInfo: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      
      setToken: (token: string) => {
        setToken(token);
        set({ token });
      },
      
      setUserInfo: (userInfo: User) => {
        setUserInfo(userInfo);
        set({ userInfo });
      },
      
      clearUser: () => {
        removeToken();
        removeUserInfo();
        set({ token: null, userInfo: null });
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);
