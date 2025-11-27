/**
 * 路由配置
 */
import { lazy } from 'react';
import type { RouteConfig } from '@/types';

// 懒加载页面组件
const Login = lazy(() => import('@/pages/Login'));
const UserManage = lazy(() => import('@/pages/User'));
const OrderManage = lazy(() => import('@/pages/Order'));
const Exception403 = lazy(() => import('@/pages/Exception/403'));
const Exception404 = lazy(() => import('@/pages/Exception/404'));
const Exception500 = lazy(() => import('@/pages/Exception/500'));

/**
 * 静态路由配置
 */
export const staticRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      hideInMenu: true,
    },
  },
  {
    path: '/403',
    name: 'Exception403',
    component: Exception403,
    meta: {
      title: '无权限',
      hideInMenu: true,
    },
  },
  {
    path: '/404',
    name: 'Exception404',
    component: Exception404,
    meta: {
      title: '页面不存在',
      hideInMenu: true,
    },
  },
  {
    path: '/500',
    name: 'Exception500',
    component: Exception500,
    meta: {
      title: '服务器错误',
      hideInMenu: true,
    },
  },
];

/**
 * 动态路由配置（需要权限）
 */
export const dynamicRoutes: RouteConfig[] = [
  {
    path: '/',
    name: 'Home',
    redirect: '/user',
    meta: {
      title: '首页',
    },
  },
  {
    path: '/user',
    name: 'UserManage',
    component: UserManage,
    meta: {
      title: '用户管理',
      icon: 'UserOutlined',
      permission: 'user:view',
    },
  },
  {
    path: '/order',
    name: 'OrderManage',
    component: OrderManage,
    meta: {
      title: '订单管理',
      icon: 'ShoppingOutlined',
      permission: 'order:view',
    },
  },
];
