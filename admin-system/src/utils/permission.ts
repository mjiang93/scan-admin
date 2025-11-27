/**
 * 权限管理核心逻辑
 */
import { usePermissionStore } from '@/store';


/**
 * 加载权限
 */
export function loadPermissions(permissions: string[]): void {
  usePermissionStore.getState().setPermissions(permissions);
}

/**
 * 验证页面权限
 */
export function hasPagePermission(permission: string): boolean {
  if (!permission) {
    return true; // 无权限要求，允许访问
  }
  
  const permissions = usePermissionStore.getState().permissions;
  return permissions.includes(permission);
}

/**
 * 验证按钮权限
 */
export function hasButtonPermission(permission: string): boolean {
  if (!permission) {
    return true;
  }
  
  return usePermissionStore.getState().hasPermission(permission);
}

/**
 * 验证多个权限（需要全部满足）
 */
export function hasAllPermissions(permissions: string[]): boolean {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  
  const userPermissions = usePermissionStore.getState().permissions;
  return permissions.every(p => userPermissions.includes(p));
}

/**
 * 验证多个权限（满足任一即可）
 */
export function hasAnyPermission(permissions: string[]): boolean {
  if (!permissions || permissions.length === 0) {
    return true;
  }
  
  const userPermissions = usePermissionStore.getState().permissions;
  return permissions.some(p => userPermissions.includes(p));
}

/**
 * 更新权限
 */
export function updatePermissions(permissions: string[]): void {
  usePermissionStore.getState().setPermissions(permissions);
  
  // 触发重新登录提示
  console.log('权限已更新，建议重新登录');
}

/**
 * 清除权限
 */
export function clearPermissions(): void {
  usePermissionStore.getState().clearPermissions();
}
