/**
 * API相关类型定义
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

export interface PageParams {
  page: number;
  pageSize: number;
  keyword?: string;
  [key: string]: any;
}

export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}
