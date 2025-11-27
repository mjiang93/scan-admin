/**
 * 订单管理服务
 */
import { get, post } from '@/utils/request';
import type { Order, PageData, PageParams } from '@/types';

/**
 * 获取订单列表
 */
export async function getOrderList(params: PageParams): Promise<PageData<Order>> {
  return get<PageData<Order>>('/api/orders', params);
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(id: string): Promise<Order> {
  return get<Order>(`/api/orders/${id}`);
}

/**
 * 导出订单
 */
export async function exportOrders(params?: { ids?: string[]; filters?: any }): Promise<void> {
  return post<void>('/api/orders/export', params);
}

/**
 * 下载订单Excel
 */
export async function downloadOrderExcel(): Promise<void> {
  // 使用post请求导出，后端返回文件流
  return post<void>('/api/orders/download');
}
