/**
 * 通用类型定义
 */
import type { ReactNode } from 'react';

export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'dateRange' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  rules?: any[];
  [key: string]: any;
}

export interface TableColumn<T = any> {
  title: string;
  dataIndex: string;
  key: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  render?: (text: any, record: T, index: number) => ReactNode;
  sorter?: boolean | ((a: T, b: T) => number);
  filters?: Array<{ text: string; value: any }>;
  onFilter?: (value: any, record: T) => boolean;
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number) => string;
  onChange?: (page: number, pageSize: number) => void;
}
