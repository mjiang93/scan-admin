/**
 * 打印机选择 Hook
 */
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getPrinterList, getAvailablePrinters } from '@/services/print';
import type { PrinterInfo, PrinterQueryParams } from '@/types/print';

export interface UsePrinterReturn {
  /** 打印机列表 */
  printers: PrinterInfo[];
  /** 加载状态 */
  loading: boolean;
  /** 总数 */
  total: number;
  /** 获取打印机列表 */
  fetchPrinters: (params?: PrinterQueryParams) => Promise<void>;
  /** 获取可用打印机列表 */
  fetchAvailablePrinters: (department?: string) => Promise<void>;
  /** 刷新列表 */
  refresh: () => Promise<void>;
}

/**
 * 打印机管理 Hook
 */
export function usePrinter(initialParams?: PrinterQueryParams): UsePrinterReturn {
  const [printers, setPrinters] = useState<PrinterInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [lastParams, setLastParams] = useState<PrinterQueryParams | undefined>(initialParams);

  const fetchPrinters = useCallback(async (params?: PrinterQueryParams) => {
    setLoading(true);
    try {
      const response = await getPrinterList(params);
      if (response.success && response.data) {
        setPrinters(response.data.result || []);
        setTotal(response.data.total || 0);
        setLastParams(params);
      } else {
        message.error(response.errorMsg || '获取打印机列表失败');
        setPrinters([]);
        setTotal(0);
      }
    } catch (error) {
      message.error('获取打印机列表失败');
      setPrinters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailablePrinters = useCallback(async (department?: string) => {
    setLoading(true);
    try {
      const response = await getAvailablePrinters(department);
      if (response.success && response.data) {
        setPrinters(response.data.result || []);
        setTotal(response.data.total || 0);
      } else {
        message.error(response.errorMsg || '获取可用打印机列表失败');
        setPrinters([]);
        setTotal(0);
      }
    } catch (error) {
      message.error('获取可用打印机列表失败');
      setPrinters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (lastParams) {
      await fetchPrinters(lastParams);
    } else {
      await fetchPrinters();
    }
  }, [lastParams, fetchPrinters]);

  return {
    printers,
    loading,
    total,
    fetchPrinters,
    fetchAvailablePrinters,
    refresh,
  };
}
