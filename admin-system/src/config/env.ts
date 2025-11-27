/**
 * 环境配置模块
 * 根据环境变量加载对应的配置
 */

export interface EnvConfig {
  apiBaseUrl: string;
  appTitle: string;
  appEnv: 'development' | 'test' | 'production';
}

// 默认配置
const defaultConfig: EnvConfig = {
  apiBaseUrl: 'http://localhost:3000',
  appTitle: '管理系统',
  appEnv: 'development',
};

/**
 * 从环境变量加载配置
 */
function loadEnvConfig(): EnvConfig {
  const config: EnvConfig = {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultConfig.apiBaseUrl,
    appTitle: import.meta.env.VITE_APP_TITLE || defaultConfig.appTitle,
    appEnv: (import.meta.env.VITE_APP_ENV as EnvConfig['appEnv']) || defaultConfig.appEnv,
  };

  // 如果配置缺失，输出警告
  if (!import.meta.env.VITE_API_BASE_URL) {
    console.warn('VITE_API_BASE_URL is not set, using default:', defaultConfig.apiBaseUrl);
  }
  if (!import.meta.env.VITE_APP_TITLE) {
    console.warn('VITE_APP_TITLE is not set, using default:', defaultConfig.appTitle);
  }
  if (!import.meta.env.VITE_APP_ENV) {
    console.warn('VITE_APP_ENV is not set, using default:', defaultConfig.appEnv);
  }

  return config;
}

// 导出配置实例
export const envConfig = loadEnvConfig();

/**
 * 获取API基础地址
 */
export function getApiBaseUrl(): string {
  return envConfig.apiBaseUrl;
}

/**
 * 获取应用标题
 */
export function getAppTitle(): string {
  return envConfig.appTitle;
}

/**
 * 获取当前环境
 */
export function getAppEnv(): EnvConfig['appEnv'] {
  return envConfig.appEnv;
}

/**
 * 判断是否为开发环境
 */
export function isDevelopment(): boolean {
  return envConfig.appEnv === 'development';
}

/**
 * 判断是否为生产环境
 */
export function isProduction(): boolean {
  return envConfig.appEnv === 'production';
}
