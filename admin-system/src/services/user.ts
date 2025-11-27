/**
 * 用户管理服务
 */
import { get, post, put, del } from '@/utils/request';
import type { User, PageData, PageParams } from '@/types';

/**
 * 获取用户列表
 */
export async function getUserList(params: PageParams): Promise<PageData<User>> {
  return get<PageData<User>>('/api/users', params);
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: string): Promise<User> {
  return get<User>(`/api/users/${id}`);
}

/**
 * 创建用户
 */
export async function createUser(data: Partial<User>): Promise<User> {
  return post<User>('/api/users', data);
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  return put<User>(`/api/users/${id}`, data);
}

/**
 * 删除用户
 */
export async function deleteUser(id: string): Promise<void> {
  return del<void>(`/api/users/${id}`);
}

/**
 * 批量删除用户
 */
export async function batchDeleteUsers(ids: string[]): Promise<void> {
  return post<void>('/api/users/batch-delete', { ids });
}
