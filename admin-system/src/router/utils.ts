/**
 * 路由工具函数
 */
import React from 'react';
import * as Icons from '@ant-design/icons';
import type { RouteConfig, MenuConfig } from '@/types';
import { hasPagePermission } from '@/utils/permission';

/**
 * 根据图标名称获取图标组件
 */
function getIcon(iconName?: string): React.ReactNode {
  if (!iconName) return null;
  
  const IconComponent = (Icons as any)[iconName];
  if (IconComponent) {
    return React.createElement(IconComponent);
  }
  
  return null;
}

/**
 * 根据权限生成动态路由
 */
export function generateRoutes(routes: RouteConfig[], permissions: string[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  
  for (const route of routes) {
    const routeCopy = { ...route };
    
    // 检查权限
    if (routeCopy.meta?.permission) {
      if (!hasPagePermission(routeCopy.meta.permission)) {
        continue; // 无权限，跳过
      }
    }
    
    // 递归处理子路由
    if (routeCopy.children && routeCopy.children.length > 0) {
      routeCopy.children = generateRoutes(routeCopy.children, permissions);
    }
    
    result.push(routeCopy);
  }
  
  return result;
}

/**
 * 路由转菜单结构
 */
export function routesToMenus(routes: RouteConfig[]): MenuConfig[] {
  const menus: MenuConfig[] = [];
  
  for (const route of routes) {
    // 跳过隐藏的菜单
    if (route.meta?.hideInMenu) {
      continue;
    }
    
    const menu: MenuConfig = {
      key: route.path,
      label: route.meta?.title || route.name,
      path: route.path,
      icon: getIcon(route.meta?.icon),
    };
    
    // 处理子菜单
    if (route.children && route.children.length > 0) {
      menu.children = routesToMenus(route.children);
    }
    
    menus.push(menu);
  }
  
  return menus;
}

/**
 * 验证路由数据完整性
 */
export function validateRoute(route: RouteConfig): boolean {
  // 必须有path
  if (!route.path) {
    return false;
  }
  
  // 必须有name
  if (!route.name) {
    return false;
  }
  
  // 如果有meta，必须有title
  if (route.meta && !route.meta.title) {
    return false;
  }
  
  return true;
}

/**
 * 扁平化路由
 */
export function flattenRoutes(routes: RouteConfig[]): RouteConfig[] {
  const result: RouteConfig[] = [];
  
  function flatten(routes: RouteConfig[]) {
    for (const route of routes) {
      result.push(route);
      if (route.children && route.children.length > 0) {
        flatten(route.children);
      }
    }
  }
  
  flatten(routes);
  return result;
}
