/**
 * 用户管理自定义Hook
 */
import { useState, useRef, useCallback } from 'react';
import { message } from 'antd';
import type { UserRecord, UserSearchParams, UserFormData } from '@/services/user';
import { 
  getUserList, 
  createUser, 
  updateUser, 
  deleteUser,
  batchDeleteUsers 
} from '@/services/user';

export interface UseUserManageReturn {
  // 数据状态
  users: UserRecord[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  
  // 操作方法
  fetchUsers: (params?: UserSearchParams, page?: number, size?: number) => Promise<void>;
  handleCreate: (data: UserFormData) => Promise<void>;
  handleUpdate: (id: string, data: Partial<UserFormData>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  handleBatchDelete: (ids: string[]) => Promise<void>;
  handleSearch: (params: UserSearchParams) => Promise<void>;
  handlePageChange: (page: number, pageSize: number) => void;
}

/**
 * 用户管理Hook
 */
export function useUserManage(): UseUserManageReturn {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  
  // 使用ref存储搜索参数，避免依赖问题
  const searchParamsRef = useRef<UserSearchParams>({});

  // 获取用户列表
  const fetchUsers = useCallback(async (params?: UserSearchParams, page?: number, size?: number) => {
    setLoading(true);
    try {
      // 如果传入了新的搜索参数，更新ref
      if (params !== undefined) {
        searchParamsRef.current = params;
      }
      
      // 使用传入的参数或默认值，避免依赖pagination状态
      const currentPage = page || 1;
      const currentSize = size || 10;
      
      const requestParams: UserSearchParams = {
        ...searchParamsRef.current,
        page: currentPage,
        size: currentSize,
        // 添加traceId用于请求追踪
        traceId: `user_list_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };
      
      const response = await getUserList(requestParams);
      
      setUsers(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        current: currentPage,
        pageSize: currentSize,
      }));
    } catch (error) {
      // 如果是取消错误，不显示错误消息
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
        console.log('获取用户列表请求被取消');
        return;
      }
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 创建用户
  const handleCreate = useCallback(async (data: UserFormData) => {
    try {
      await createUser(data);
      message.success('创建用户成功');
      await fetchUsers();
    } catch (error) {
      // 如果是取消错误，不显示错误消息
      if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
        console.log('创建用户请求被取消');
        return;
      }
      console.error('创建用户失败:', error);
      message.error('创建用户失败');
      throw error;
    }
  }, [fetchUsers]);

  // 更新用户
  const handleUpdate = useCallback(async (id: string, data: Partial<UserFormData>) => {
    try {
      await updateUser(id, data);
      message.success('更新用户成功');
      await fetchUsers();
    } catch (error) {
      console.error('更新用户失败:', error);
      message.error('更新用户失败');
      throw error;
    }
  }, [fetchUsers]);

  // 删除用户
  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUser(id);
      message.success('删除用户成功');
      await fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
      throw error;
    }
  }, [fetchUsers]);

  // 批量删除用户
  const handleBatchDelete = useCallback(async (ids: string[]) => {
    try {
      await batchDeleteUsers(ids);
      message.success(`成功删除 ${ids.length} 个用户`);
      await fetchUsers();
    } catch (error) {
      console.error('批量删除用户失败:', error);
      message.error('批量删除用户失败');
      throw error;
    }
  }, [fetchUsers]);

  // 搜索用户
  const handleSearch = useCallback(async (params: UserSearchParams) => {
    searchParamsRef.current = params;
    await fetchUsers(params, 1);
  }, [fetchUsers]);

  // 分页变化
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize,
    }));
    fetchUsers(undefined, page, pageSize);
  }, [fetchUsers]);

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleBatchDelete,
    handleSearch,
    handlePageChange,
  };
}