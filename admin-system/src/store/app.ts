/**
 * 应用状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  collapsed: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      theme: 'light',
      loading: false,
      
      setCollapsed: (collapsed: boolean) => {
        set({ collapsed });
      },
      
      toggleCollapsed: () => {
        set({ collapsed: !get().collapsed });
      },
      
      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
      },
      
      setLoading: (loading: boolean) => {
        set({ loading });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        collapsed: state.collapsed,
        theme: state.theme,
      }),
    }
  )
);
