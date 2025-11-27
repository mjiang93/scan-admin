/**
 * 权限Hook
 */
import { usePermissionStore } from '@/store';
import { hasPagePermission, hasButtonPermission, hasAllPermissions, hasAnyPermission } from '@/utils/permission';

export function usePermission() {
  const { permissions, role } = usePermissionStore();

  return {
    // 状态
    permissions,
    role,
    
    // 方法
    hasPagePermission,
    hasButtonPermission,
    hasAllPermissions,
    hasAnyPermission,
  };
}
