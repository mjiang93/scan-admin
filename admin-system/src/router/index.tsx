/**
 * 路由入口
 * 集成动态路由、路由守卫、懒加载
 */
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { staticRoutes, dynamicRoutes } from './routes';
import { generateRoutes } from './utils';
import { RouteGuard } from './guard';
import { usePermissionStore } from '@/store';
import BasicLayout from '@/layouts/BasicLayout';
import BlankLayout from '@/layouts/BlankLayout';
import { PageLoading } from '@/components';

/**
 * 创建路由配置
 * 根据用户权限动态生成可访问的路由
 */
export function createRoutes() {
  const permissions = usePermissionStore.getState().permissions;
  const authorizedRoutes = generateRoutes(dynamicRoutes, permissions);
  
  const router = createBrowserRouter([
    // 需要认证的路由（使用 BasicLayout）
    {
      path: '/',
      element: (
        <RouteGuard requireAuth>
          <BasicLayout />
        </RouteGuard>
      ),
      children: [
        // 默认重定向到用户管理页面
        {
          index: true,
          element: <Navigate to="/user" replace />,
        },
        // 动态生成的授权路由
        ...authorizedRoutes.map(route => ({
          path: route.path.startsWith('/') ? route.path.slice(1) : route.path,
          element: (
            <Suspense fallback={<PageLoading />}>
              <RouteGuard 
                requiredPermissions={route.meta?.permission ? [route.meta.permission] : undefined}
              >
                {route.component && <route.component />}
              </RouteGuard>
            </Suspense>
          ),
        })),
      ],
    },
    // 静态路由（不需要认证，使用 BlankLayout）
    ...staticRoutes.map(route => ({
      path: route.path,
      element: (
        <BlankLayout>
          <Suspense fallback={<PageLoading />}>
            {route.component && <route.component />}
          </Suspense>
        </BlankLayout>
      ),
    })),
    // 404 页面
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
  
  return router;
}

/**
 * 路由组件
 * 提供路由上下文
 */
export function AppRouter() {
  const router = createRoutes();
  return <RouterProvider router={router} />;
}

export * from './routes';
export * from './utils';
export * from './guard';
