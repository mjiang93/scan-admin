/**
 * 用户相关类型定义
 */

export enum UserStatus {
  DISABLED = 0,
  ENABLED = 1,
}

export interface User {
  userId: string;
  userName: string;
  nickname?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId?: string;
  roleName?: string;
  status?: UserStatus;
  createTime?: string;
  updateTime?: string;
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
  userId: string;
  password: string;
}

// 根据实际API响应格式定义
export interface LoginData {
  status: number;
  token: string;
  userId: string;
  userName: string;
}

export interface LoginResult {
  code: number;
  data: LoginData;
  errorMsg: string;
  msg: string;
  success: boolean;
}
