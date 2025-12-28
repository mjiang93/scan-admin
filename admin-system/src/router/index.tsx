/**
 * 路由入口
 * 集成动态路由、路由守卫、懒加载
 */
import { createHashRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { staticRoutes, dynamicRoutes } from './routes';
import { RouteGuard } from './guard';
import BasicLayout from '@/layouts/BasicLayout';
import BlankLayout from '@/layouts/BlankLayout';
import { PageLoading } from '@/components';

/**
 * 创建路由配置
 */
function createRoutes() {
  // 不依赖权限状态，直接使用所有动态路由
  const authorizedRoutes = dynamicRoutes;
  
  const router = createHashRouter([
    // 需要认证的路由（使用 BasicLayout）
    {
      path: '/',
      element: (
        <RouteGuard requireAuth>
          <BasicLayout />
        </RouteGuard>
      ),
      children: [
        // 默认重定向到条码打印页面
        {
          index: true,
          element: <Navigate to="/print" replace />,
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
