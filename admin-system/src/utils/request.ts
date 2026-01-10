/**
 * HTTP请求封装
 */
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getApiBaseUrl, getConfig } from '@/config';
import { getToken } from '@/utils/storage';

// 请求队列，用于取消重复请求
const pendingRequests = new Map<string, AbortController>();

/**
 * 生成请求唯一标识
 */
function generateRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

/**
 * 添加待处理请求
 */
function addPendingRequest(config: AxiosRequestConfig): void {
  // 暂时禁用重复请求取消功能，避免CanceledError问题
  // 在用户管理场景下，允许重复请求可能更合适
  const controller = new AbortController();
  config.signal = controller.signal;
  
  // 使用唯一key存储每个请求
  const uniqueKey = `${generateRequestKey(config)}_${Date.now()}_${Math.random()}`;
  pendingRequests.set(uniqueKey, controller);
}

/**
 * 移除待处理请求
 */
function removePendingRequest(config: AxiosRequestConfig): void {
  // 由于使用唯一key，需要查找并删除对应的请求
  const baseKey = generateRequestKey(config);
  const keysToDelete: string[] = [];
  
  for (const [key] of pendingRequests) {
    if (key.startsWith(baseKey + '_')) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => pendingRequests.delete(key));
}

/**
 * 显示错误消息
 */
function showErrorMessage(errorMessage: string): void {
  // 发送自定义事件来显示错误消息
  window.dispatchEvent(new CustomEvent('showErrorMessage', {
    detail: { message: errorMessage }
  }));
  
  // 同时输出到控制台用于调试
  console.error('API Error:', errorMessage);
  
  // 可以在这里添加其他错误处理逻辑，比如发送到错误监控服务
}

/**
 * 创建axios实例
 */
const instance: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: getConfig('request').timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers['token'] = token;
    }
    addPendingRequest(config);
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    removePendingRequest(response.config);
    const { data } = response;
    
    // 如果是blob类型，直接返回
    if (response.config.responseType === 'blob') {
      return data;
    }
    
    // 只有当 code === 0 时才算成功
    if (data.code === 0) {
      return data;
    }
    
    // 其他情况都算失败，统一处理错误信息
    const errorMessage = data.errorMsg || data.msg || data.message || '请求失败';
    showErrorMessage(errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
  async (error: AxiosError) => {
    if (error.config) {
      removePendingRequest(error.config);
    }
    // 如果是取消的请求，直接返回错误，不显示错误消息
    if (axios.isCancel(error)) {
      console.log('请求被取消:', error.message);
      return Promise.reject(error);
    }
    if (!error.response) {
      showErrorMessage('网络连接失败，请检查网络');
      return Promise.reject(error);
    }
    const { status } = error.response;
    switch (status) {
      case 401:
        localStorage.removeItem(getConfig('token').key);
        localStorage.removeItem(getConfig('token').expiresKey);
        localStorage.removeItem('loginData');
        showErrorMessage('登录已过期，请重新登录');
        window.location.href = '/login';
        break;
      case 403:
        showErrorMessage('您没有权限执行此操作');
        break;
      case 404:
        showErrorMessage('请求的资源不存在');
        break;
      case 500:
        showErrorMessage('服务器错误，请稍后重试');
        break;
      default:
        { const errorData = error.response.data as any;
        showErrorMessage(errorData?.errorMsg || errorData?.msg || errorData?.message || '请求失败'); }
    }
    return Promise.reject(error);
  }
);

/**
 * 发送请求（不重试）
 */
async function sendRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await instance.request<any, T>(config);
  return response;
}

export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return sendRequest<T>({ method: 'GET', url, params, ...config });
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return sendRequest<T>({ method: 'POST', url, data, ...config });
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return sendRequest<T>({ method: 'PUT', url, data, ...config });
}

export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return sendRequest<T>({ method: 'DELETE', url, params, ...config });
}

export default instance;
