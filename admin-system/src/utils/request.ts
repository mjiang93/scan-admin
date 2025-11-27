/**
 * HTTP请求封装
 */
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { message } from 'antd';
import { getApiBaseUrl, getConfig } from '@/config';

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
  const requestKey = generateRequestKey(config);
  
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller?.abort();
  }
  
  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);
}

/**
 * 移除待处理请求
 */
function removePendingRequest(config: AxiosRequestConfig): void {
  const requestKey = generateRequestKey(config);
  pendingRequests.delete(requestKey);
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
    const token = localStorage.getItem(getConfig('token').key);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (data.code === 200 || data.success) {
      return data;
    }
    message.error(data.message || '请求失败');
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  async (error: AxiosError) => {
    if (error.config) {
      removePendingRequest(error.config);
    }
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (!error.response) {
      message.error('网络连接失败，请检查网络');
      return Promise.reject(error);
    }
    const { status } = error.response;
    switch (status) {
      case 401:
        localStorage.removeItem(getConfig('token').key);
        localStorage.removeItem(getConfig('token').expiresKey);
        message.error('登录已过期，请重新登录');
        window.location.href = '/login';
        break;
      case 403:
        message.error('您没有权限执行此操作');
        break;
      case 404:
        message.error('请求的资源不存在');
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        { const errorData = error.response.data as any;
        message.error(errorData?.message || '请求失败'); }
    }
    return Promise.reject(error);
  }
);

/**
 * 请求重试
 */
async function requestWithRetry<T>(
  config: AxiosRequestConfig,
  retryCount: number = getConfig('request').retryCount
): Promise<T> {
  try {
    const response = await instance.request<any, T>(config);
    return response;
  } catch (error) {
    if (retryCount > 0 && !axios.isCancel(error)) {
      await new Promise(resolve => setTimeout(resolve, getConfig('request').retryDelay));
      return requestWithRetry<T>(config, retryCount - 1);
    }
    throw error;
  }
}

export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return requestWithRetry<T>({ method: 'GET', url, params, ...config });
}

export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return requestWithRetry<T>({ method: 'POST', url, data, ...config });
}

export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return requestWithRetry<T>({ method: 'PUT', url, data, ...config });
}

export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return requestWithRetry<T>({ method: 'DELETE', url, params, ...config });
}

export default instance;
