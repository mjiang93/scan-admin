/**
 * 权限状态管理
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Role } from '@/types';

interface PermissionState {
  permissions: string[];
  role: Role | null;
  setPermissions: (permissions: string[]) => void;
  setRole: (role: Role) => void;
  hasPermission: (permission: string) => boolean;
  clearPermissions: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      permissions: [],
      role: null,
      
      setPermissions: (permissions: string[]) => {
        set({ permissions });
      },
      
      setRole: (role: Role) => {
        set({ role, permissions: role.permissions });
      },
      
      hasPermission: (permission: string) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },
      
      clearPermissions: () => {
        set({ permissions: [], role: null });
      },
    }),
    {
      name: 'permission-storage',
      partialize: (state) => ({
        permissions: state.permissions,
        role: state.role,
      }),
    }
  )
);
