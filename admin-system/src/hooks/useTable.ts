/**
 * 表格Hook
 */
import { useState } from 'react';
import type { TablePaginationConfig } from 'antd';

export interface UseTableOptions {
  defaultPageSize?: number;
  onLoad?: (params: any) => Promise<{ list: any[]; total: number }>;
}

export function useTable(options: UseTableOptions = {}) {
  const { defaultPageSize = 10, onLoad } = options;

  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  /**
   * 加载数据
   */
  const loadData = async (params?: any) => {
    if (!onLoad) return;

    setLoading(true);
    try {
      const result = await onLoad({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });

      setDataSource(result.list);
      setPagination((prev) => ({
        ...prev,
        total: result.total,
      }));
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 刷新数据
   */
  const refresh = () => {
    loadData();
  };

  /**
   * 分页变化
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize,
    }));
    loadData();
  };

  return {
    // 状态
    loading,
    dataSource,
    pagination: {
      ...pagination,
      onChange: handlePageChange,
    },

    // 方法
    loadData,
    refresh,
    setDataSource,
  };
}
