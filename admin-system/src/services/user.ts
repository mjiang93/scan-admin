/**
 * 用户管理相关API服务
 */
import { post } from '@/utils/request';

// 用户数据类型
export interface UserRecord {
  id: string;
  userId: string; // API返回的userId字段
  userName: string; // API返回的userName字段
  password?: string;
  status: number; // API返回数字类型：0-正常，1-禁用
  createTime: string;
  creator: string;
  modifier: string;
  modifiyTime: string | null;
  // 为了兼容UI显示，添加映射字段
  username?: string; // 映射自userId
  realName?: string; // 映射自userName
}

// 搜索参数类型
export interface UserSearchParams {
  userId?: string; // 对应API的userId字段
  userName?: string; // 对应API的userName字段
  status?: number; // API使用数字类型
  page?: number;
  size?: number;
  offset?: number;
  traceId?: string;
}

// 分页请求参数类型
export interface UserPageRequest {
  offset?: number;
  page: number;
  size: number;
  traceId?: string;
  userId?: string; // 对应API字段
  userName?: string; // 对应API字段
  status?: number; // API使用数字类型
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
  userId: string; // 对应API的userId字段
  userName: string; // 对应API的userName字段
  password?: string;
  status: number; // API使用数字类型：0-正常，1-禁用
}

// 用户注册请求参数类型
export interface UserRegisterRequest {
  operator: string;
  password: string;
  userId: string; // 用户ID
  userName: string; // 用户名称
}

// 用户编辑请求参数类型
export interface UserEditRequest {
  id: string; // 用户ID
  operator: string;
  password?: string;
  userId: string;
  userName: string;
}

/**
 * 获取用户列表
 */
export async function getUserList(params: UserSearchParams): Promise<UserListResponse> {
  // 构建请求参数，按照接口要求的格式
  const requestBody: UserPageRequest = {
    page: params.page || 1,
    size: params.size || 10,
    // 搜索条件
    ...(params.userId && { userId: params.userId }),
    ...(params.userName && { userName: params.userName }),
    ...(params.status !== undefined && { status: params.status }),
  };

  try {
    const response = await post<{
      code: number;
      data: {
        empty: boolean;
        result: UserRecord[];
        total: number;
      };
      errorMsg: string;
      msg: string;
      success: boolean;
    }>('/user/page', requestBody);
    
    // 处理API响应，映射字段并转换数据格式
    if (response && response.success && response.data && Array.isArray(response.data.result)) {
      const mappedUsers = response.data.result.map(user => ({
        ...user,
        // 为了兼容UI组件，添加映射字段
        username: user.userId,
        realName: user.userName,
        registerTime: user.createTime ? new Date(parseInt(user.createTime)).toLocaleString() : '',
      }));

      return {
        data: mappedUsers,
        total: response.data.total || 0,
        current: params.page || 1,
        pageSize: params.size || 10,
      };
    }
    
    // 默认返回空数据
    console.warn('用户列表API返回了意外的数据结构:', response);
    return {
      data: [],
      total: 0,
      current: params.page || 1,
      pageSize: params.size || 10,
    };
  } catch (error) {
    // 如果是取消错误，直接抛出，不处理
    if (error && typeof error === 'object' && 'name' in error && error.name === 'CanceledError') {
      throw error;
    }
    
    console.error('获取用户列表失败:', error);
    // 返回空数据而不是抛出错误，避免页面崩溃
    return {
      data: [],
      total: 0,
      current: params.page || 1,
      pageSize: params.size || 10,
    };
  }
}

/**
 * 创建用户
 */
export async function createUser(data: UserFormData): Promise<void> {
  // 获取当前登录用户ID作为operator
  let operator = "登录的userId"; // 默认值
  
  try {
    const cachedLoginData = localStorage.getItem('loginData');
    if (cachedLoginData) {
      const loginData = JSON.parse(cachedLoginData);
      operator = loginData.userId || "登录的userId";
    }
  } catch (error) {
    console.error('获取登录用户信息失败:', error);
  }

  // 构建注册请求参数
  const registerRequest: UserRegisterRequest = {
    operator: operator,
    password: data.password || '',
    userId: data.userId, // 使用userId字段
    userName: data.userName, // 使用userName字段
  };

  console.log('创建用户请求参数:', registerRequest);

  // 使用封装的post方法，通过代理调用注册接口
  const response = await post<{
    code: number;
    data: unknown; // 成功时可能为null
    errorMsg: string;
    msg: string;
    success: boolean;
  }>('/user/register', registerRequest);

  console.log('创建用户响应:', response);

  if (response && response.success && response.code === 0) {
    // 成功时不需要返回数据，只需要确认操作成功
    return;
  }
  
  throw new Error(response?.errorMsg || response?.msg || '创建用户失败');
}

/**
 * 更新用户
 */
export async function updateUser(id: string, data: Partial<UserFormData>): Promise<void> {
  // 获取当前登录用户ID作为operator
  let operator = "登录的userId"; // 默认值
  
  try {
    const cachedLoginData = localStorage.getItem('loginData');
    if (cachedLoginData) {
      const loginData = JSON.parse(cachedLoginData);
      operator = loginData.userId || "登录的userId";
    }
  } catch (error) {
    console.error('获取登录用户信息失败:', error);
  }

  // 构建编辑请求参数
  const editRequest: UserEditRequest = {
    id: id,
    operator: operator,
    userId: data.userId || '',
    userName: data.userName || '',
  };

  // 如果提供了密码，则包含密码字段
  if (data.password) {
    editRequest.password = data.password;
  }

  console.log('编辑用户请求参数:', editRequest);

  // 使用封装的post方法，通过代理调用编辑接口
  const response = await post<{
    code: number;
    data: unknown; // 成功时可能为null
    errorMsg: string;
    msg: string;
    success: boolean;
  }>('/user/edit', editRequest);

  console.log('编辑用户响应:', response);

  if (response && response.success && response.code === 0) {
    // 成功时不需要返回数据，只需要确认操作成功
    return;
  }
  
  throw new Error(response?.errorMsg || response?.msg || '更新用户失败');
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