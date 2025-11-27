/**
 * 用户相关类型定义
 */

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId: string;
  roleName: string;
  status: UserStatus;
  createTime: string;
  updateTime: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  permissions: string[];
  description?: string;
  createTime: string;
  updateTime: string;
}

export enum PermissionType {
  PAGE = 'page',
  BUTTON = 'button',
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  type: PermissionType;
  parentId?: string;
  path?: string;
  icon?: string;
  sort?: number;
}

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  userInfo: User;
  permissions: string[];
}
