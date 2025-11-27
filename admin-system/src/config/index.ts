/**
 * 配置管理入口
 * 提供统一的配置访问接口
 */

import { envConfig, getApiBaseUrl, getAppTitle, getAppEnv, isDevelopment, isProduction } from './env';

// 应用配置
export interface AppConfig {
  // 分页配置
  pagination: {
    defaultPageSize: number;
    pageSizeOptions: number[];
  };
  // 请求配置
  request: {
    timeout: number;
    retryCount: number;
    retryDelay: number;
  };
  // 上传配置
  upload: {
    maxSize: number; // MB
    acceptTypes: string[];
  };
  // Token配置
  token: {
    key: string;
    expiresKey: string;
  };
}

// 默认应用配置
const defaultAppConfig: AppConfig = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },
  request: {
    timeout: 30000, // 30秒
    retryCount: 3,
    retryDelay: 1000, // 1秒
  },
  upload: {
    maxSize: 10, // 10MB
    acceptTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  },
  token: {
    key: 'admin_token',
    expiresKey: 'admin_token_expires',
  },
};

// 应用配置实例
const appConfig: AppConfig = { ...defaultAppConfig };

/**
 * 获取配置项
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return appConfig[key];
}

/**
 * 设置配置项
 */
export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]): void {
  appConfig[key] = value;
}

/**
 * 获取完整配置
 */
export function getAllConfig(): AppConfig {
  return { ...appConfig };
}

// 导出环境配置相关
export { envConfig, getApiBaseUrl, getAppTitle, getAppEnv, isDevelopment, isProduction };

// 导出配置类型
export type { EnvConfig } from './env';
