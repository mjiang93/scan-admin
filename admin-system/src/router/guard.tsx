/**
 * 路由守卫
 * 实现认证检查和权限验证
 */
import { Navigate, useLocation } from 'react-router-dom';
import { checkLoginStatus } from '@/services/auth';
import { hasPagePermission } from '@/utils/permission';
import { useUserStore } from '@/store';

interface RouteGuardProps {
  children: React.ReactNode;
  /** 是否需要认证 */
  requireAuth?: boolean;
  /** 所需权限列表 */
  requiredPermissions?: string[];
}

/**
 * 路由守卫组件
 * 功能：
 * 1. 验证用户登录状态
 * 2. 检查路由访问权限
 * 3. 处理未授权访问
 */
export function RouteGuard({ 
  children, 
  requireAuth = false, 
  requiredPermissions 
}: RouteGuardProps) {
  const location = useLocation();
  const token = useUserStore((state) => state.token);
  
  // 检查登录状态
  if (requireAuth) {
    const isLoggedIn = checkLoginStatus() || !!token;
    
    if (!isLoggedIn) {
      // 未登录，跳转到登录页面，并记录来源页面
      return (
        <Navigate 
          to="/login" 
          state={{ from: location.pathname }} 
          replace 
        />
      );
    }
  }
  
  // 检查权限
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasPermission = requiredPermissions.every(permission => 
      hasPagePermission(permission)
    );
    
    if (!hasPermission) {
      // 无权限，跳转到 403 页面
      return <Navigate to="/403" replace />;
    }
  }
  
  return <>{children}</>;
}

/**
 * 高阶组件：为组件添加路由守卫
 */
export function withRouteGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps?: Omit<RouteGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteGuard {...guardProps}>
        <WrappedComponent {...props} />
      </RouteGuard>
    );
  };
}
