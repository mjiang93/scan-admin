/**
 * 用户管理相关API服务
 */
import { post } from '@/utils/request';

// 用户数据类型
export interface UserRecord {
  id: string;
  username: string;
  realName: string;
  email?: string;
  phone?: string;
  role?: string;
  roleName?: string;
  status: 'normal' | 'disabled';
  registerTime: string;
  lastLoginTime?: string;
}

// 搜索参数类型
export interface UserSearchParams {
  username?: string;
  realName?: string;
  status?: string;
  page?: number;
  size?: number;
  offset?: number;
  traceId?: string;
}

// 分页请求参数类型
export interface UserPageRequest {
  offset: number;
  page: number;
  size: number;
  traceId: string;
  username?: string;
  realName?: string;
  status?: string;
}

// 分页响应类型
export interface UserListResponse {
  data: UserRecord[];
  total: number;
  current: number;
  pageSize: number;
}

// 用户表单数据类型
export interface UserFormData {
  username: string;
  realName: string;
  email?: string;
  phone?: string;
  status: 'normal' | 'disabled';
  role?: string;
}

/**
 * 获取用户列表
 */
export async function getUserList(params: UserSearchParams): Promise<UserListResponse> {
  // 构建请求参数，按照接口要求的格式
  const requestBody: UserPageRequest = {
    offset: ((params.page || 1) - 1) * (params.size || 10),
    page: (params.page || 1) - 1, // 后端页码从0开始
    size: params.size || 10,
    traceId: params.traceId || generateTraceId(),
    // 搜索条件
    ...(params.username && { username: params.username }),
    ...(params.realName && { realName: params.realName }),
    ...(params.status && { status: params.status }),
  };

  return post('/user/page', requestBody);
}

/**
 * 生成追踪ID
 */
function generateTraceId(): string {
  return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建用户
 */
export async function createUser(data: UserFormData): Promise<UserRecord> {
  return post('/api/users', data);
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: Partial<UserFormData>): Promise<UserRecord> {
  return post(`/api/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<void> {
  return post(`/api/users/${id}/delete`);
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: string): Promise<UserRecord> {
  return post(`/api/users/${id}/detail`);
}

/**
 * 批量删除用户
 */
export async function batchDeleteUsers(ids: string[]): Promise<void> {
  return post('/api/users/batch-delete', { ids });
}