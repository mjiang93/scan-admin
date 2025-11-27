/**
 * 路由相关类型定义
 */
import type { ComponentType } from 'react';

export interface RouteMeta {
  title: string;
  icon?: string;
  permission?: string;
  hideInMenu?: boolean;
  keepAlive?: boolean;
}

export interface RouteConfig {
  path: string;
  name: string;
  component?: ComponentType<any>;
  redirect?: string;
  meta?: RouteMeta;
  children?: RouteConfig[];
}

export interface MenuConfig {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuConfig[];
}
