/**
 * 打印服务
 */
import { post, get } from '@/utils/request';
import { setStorage, getStorage } from '@/utils/storage';
import type {
  PrintConfig,
  PrintLog,
  PrintContentData,
  PrintTemplateType,
  BarcodeQueryParams,
  PrintApiResponse,
  ApiBarcodeRecord,
} from '@/types/print';
import {
  validatePrintContent,
  hasBarcode,
  hasQRCode,
} from '@/types/print';

const PRINT_LOGS_KEY = 'print_logs';
const MAX_LOGS = 100;

/**
 * 查询条码记录
 */
export async function queryBarcodeRecords(params: Partial<BarcodeQueryParams>): Promise<PrintApiResponse<ApiBarcodeRecord>> {
  const requestParams: BarcodeQueryParams = {
    page: params.page || 1,
    size: params.size || 10,
    // offset: params.offset || 0,
    // traceId: params.traceId || 'web-query',
    ...params,
  };

  // 如果有日期范围，转换为年月日格式 (YYYY-MM-DD)
  if (params.deliveryDateStart) {
    const date = new Date(params.deliveryDateStart);
    requestParams.deliveryDateStart = date.toISOString().split('T')[0];
  }
  if (params.deliveryDateEnd) {
    const date = new Date(params.deliveryDateEnd);
    requestParams.deliveryDateEnd = date.toISOString().split('T')[0];
  }

  try {
    const response = await post<PrintApiResponse<ApiBarcodeRecord>>('/pc/page', requestParams);
    return response;
  } catch (error) {
    console.error('查询条码记录失败:', error);
    throw error;
  }
}

/**
 * 导出条码记录Excel
 */
export async function exportBarcodeRecords(params: Partial<BarcodeQueryParams>): Promise<Blob> {
  const requestParams: BarcodeQueryParams = {
    page: params.page || 1,
    size: params.size || 10,
    ...params,
  };

  // 如果有日期范围，转换为年月日格式 (YYYY-MM-DD)
  if (params.deliveryDateStart) {
    const date = new Date(params.deliveryDateStart);
    requestParams.deliveryDateStart = date.toISOString().split('T')[0];
  }
  if (params.deliveryDateEnd) {
    const date = new Date(params.deliveryDateEnd);
    requestParams.deliveryDateEnd = date.toISOString().split('T')[0];
  }

  try {
    const response = await post<Blob>('/pc/export', requestParams, {
      responseType: 'blob',
    });
    return response;
  } catch (error) {
    console.error('导出条码记录失败:', error);
    throw error;
  }
}

/**
 * 更新条码记录
 */
export async function updateBarcodeRecord(data: ApiBarcodeRecord & { operator?: string }): Promise<PrintApiResponse<ApiBarcodeRecord>> {
  try {
    const response = await post<PrintApiResponse<ApiBarcodeRecord>>('/pc/edit', data);
    return response;
  } catch (error) {
    console.error('更新条码记录失败:', error);
    throw error;
  }
}

/**
 * 批量添加附件
 */
export async function batchEditAccessory(params: {
  ids: number[];
  operator: string;
  accessoryCnt: number;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pc/editaccessory', params);
    return response;
  } catch (error) {
    console.error('批量添加附件失败:', error);
    throw error;
  }
}

/**
 * 批量修改送货时间
 */
export async function batchEditDeliveryDate(params: {
  ids: number[];
  deliveryDate: string;
  operator: string;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pc/editdelivery', params);
    return response;
  } catch (error) {
    console.error('批量修改送货时间失败:', error);
    throw error;
  }
}

/**
 * 批量更新图纸版本
 */
export async function batchEditDrawingVersion(params: {
  ids: number[];
  drawingVersion: string;
  operator: string;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pc/editdvs', params);
    return response;
  } catch (error) {
    console.error('批量更新图纸版本失败:', error);
    throw error;
  }
}

/**
 * 同步ERP系统
 */
export async function syncErpSystem(params: {
  projectCode: string;
  operator: string;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pda/scanpcode', params);
    return response;
  } catch (error) {
    console.error('同步ERP系统失败:', error);
    throw error;
  }
}

/**
 * 生成SN码和09码
 */
export async function createCode(params: {
  id: string;
  operator: string;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pc/createcode', null, { params });
    return response;
  } catch (error) {
    console.error('生成SN码和09码失败:', error);
    throw error;
  }
}

/**
 * 本体码打印预览-生成条码
 */
export async function getBtPrintInfo(params: {
  id: string;
  operator: string;
}): Promise<PrintApiResponse<{
  pnCode: string;
  revCode: string;
  modelCode: string;
  codeSN: string;
  fjList: string[];
}>> {
  try {
    const response = await post<PrintApiResponse<{
      pnCode: string;
      revCode: string;
      modelCode: string;
      codeSN: string;
      fjList: string[];
    }>>('/pc/btprint', null, { params });
    return response;
  } catch (error) {
    console.error('获取本体打印信息失败:', error);
    throw error;
  }
}

/**
 * 更新打印状态
 */
export async function updatePrintStatus(params: {
  id: number;
  operator: string;
  btPrintCnt?: number;
  nbzPrintCnt?: number;
  wbzPrintCnt?: number;
}): Promise<PrintApiResponse<unknown>> {
  try {
    const response = await post<PrintApiResponse<unknown>>('/pc/editprint', params);
    return response;
  } catch (error) {
    console.error('更新打印状态失败:', error);
    throw error;
  }
}

/**
 * 扫描本体码获取内包装打印信息
 */
export async function scanBtcode(btcode: string): Promise<{
  id: string;
  partNo: string;
  qty: string;
  remark: string;
  dcDate: string;
  supplierCode: string;
  codeSN: string;
}> {
  try {
    const response = await get<{
      code: number;
      success: boolean;
      data: {
        id: string;
        partNo: string;
        qty: string;
        remark: string;
        dcDate: string;
        supplierCode: string;
        codeSN: string;
      };
      errorMsg: string;
      msg: string;
    }>('/pda/scanbtcode', { btcode });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.errorMsg || '获取内包装信息失败');
  } catch (error) {
    console.error('扫描本体码失败:', error);
    throw error;
  }
}

/**
 * 扫描内包装码获取外包装打印信息
 */
export async function scanNbzcode(nbzcode: string): Promise<{
  id: number;
  materialCode: string;
  nameModel: string;
  supplierCode: string;
  unit: string;
  cnt: number;
  code09: string;
  codeSN: string;
  deliveryDate: string;
  deliveryNo: string;
  poNo: string;
  saveClean: string;
}> {
  try {
    const response = await get<{
      code: number;
      success: boolean;
      data: {
        id: number;
        materialCode: string;
        nameModel: string;
        supplierCode: string;
        unit: string;
        cnt: number;
        code09: string;
        codeSN: string;
        deliveryDate: string;
        deliveryNo: string;
        poNo: string;
        saveClean: string;
      };
      errorMsg: string;
      msg: string;
    }>('/pda/scannbzcode', { nbzcode });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.errorMsg || '获取外包装信息失败');
  } catch (error) {
    console.error('扫描内包装码失败:', error);
    throw error;
  }
}

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 获取当前用户信息（从存储中获取）
 */
function getCurrentUser(): { userId: string; username: string } {
  const userInfo = getStorage<{ id: string; username: string }>('userInfo');
  return {
    userId: userInfo?.id || 'unknown',
    username: userInfo?.username || 'unknown',
  };
}

/**
 * 创建打印日志
 */
export function createPrintLog(
  config: PrintConfig,
  status: 'success' | 'failed' | 'cancelled',
  errorMessage?: string
): PrintLog {
  const user = getCurrentUser();
  
  return {
    id: generateId(),
    printTime: new Date().toISOString(),
    userId: user.userId,
    username: user.username,
    templateType: config.templateType,
    content: config.content,
    copies: config.copies || 1,
    status,
    errorMessage,
  };
}

/**
 * 保存打印日志
 */
export function savePrintLog(log: PrintLog): void {
  const logs = getPrintLogs();
  logs.unshift(log);
  
  // 限制日志数量
  if (logs.length > MAX_LOGS) {
    logs.splice(MAX_LOGS);
  }
  
  setStorage(PRINT_LOGS_KEY, logs);
}

/**
 * 获取打印日志列表
 */
export function getPrintLogs(): PrintLog[] {
  return getStorage<PrintLog[]>(PRINT_LOGS_KEY) || [];
}

/**
 * 清空打印日志
 */
export function clearPrintLogs(): void {
  setStorage(PRINT_LOGS_KEY, []);
}

/**
 * 验证打印配置
 */
export function validatePrintConfig(config: PrintConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证模板类型
  if (!config.templateType) {
    errors.push('模板类型不能为空');
  }

  // 验证打印内容
  if (!config.content) {
    errors.push('打印内容不能为空');
  } else {
    const contentValidation = validatePrintContent(config.templateType, config.content);
    if (!contentValidation.valid) {
      errors.push(`缺少必填字段: ${contentValidation.missingFields.join(', ')}`);
    }
  }

  // 验证打印份数
  if (config.copies !== undefined && (config.copies < 1 || config.copies > 100)) {
    errors.push('打印份数必须在1-100之间');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 检查打印内容是否包含必需元素（条码或二维码）
 */
export function checkPrintElements(
  templateType: PrintTemplateType,
  content: PrintContentData
): {
  hasRequiredElements: boolean;
  hasBarcode: boolean;
  hasQRCode: boolean;
  hasCode: boolean;
} {
  const needsBarcode = hasBarcode(templateType);
  const needsQRCode = hasQRCode(templateType);
  const hasCode = !!content.code && content.code.trim() !== '';

  return {
    hasRequiredElements: hasCode && (needsBarcode || needsQRCode),
    hasBarcode: needsBarcode && hasCode,
    hasQRCode: needsQRCode && hasCode,
    hasCode,
  };
}

/**
 * 执行打印
 */
export function executePrint(config: PrintConfig): Promise<PrintLog> {
  return new Promise((resolve, reject) => {
    // 验证配置
    const validation = validatePrintConfig(config);
    if (!validation.valid) {
      const log = createPrintLog(config, 'failed', validation.errors.join('; '));
      savePrintLog(log);
      reject(new Error(validation.errors.join('; ')));
      return;
    }

    // 检查必需元素
    const elements = checkPrintElements(config.templateType, config.content);
    if (!elements.hasRequiredElements) {
      const log = createPrintLog(config, 'failed', '打印内容缺少必需的条码或二维码');
      savePrintLog(log);
      reject(new Error('打印内容缺少必需的条码或二维码'));
      return;
    }

    try {
      // 调用浏览器打印
      window.print();
      
      // 创建成功日志
      const log = createPrintLog(config, 'success');
      savePrintLog(log);
      resolve(log);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '打印失败';
      const log = createPrintLog(config, 'failed', errorMessage);
      savePrintLog(log);
      reject(error);
    }
  });
}

/**
 * 取消打印
 */
export function cancelPrint(config: PrintConfig): PrintLog {
  const log = createPrintLog(config, 'cancelled', '用户取消打印');
  savePrintLog(log);
  return log;
}

/**
 * 根据模板类型获取打印日志
 */
export function getPrintLogsByTemplate(templateType: PrintTemplateType): PrintLog[] {
  const logs = getPrintLogs();
  return logs.filter(log => log.templateType === templateType);
}

/**
 * 根据日期范围获取打印日志
 */
export function getPrintLogsByDateRange(startDate: string, endDate: string): PrintLog[] {
  const logs = getPrintLogs();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return logs.filter(log => {
    const logTime = new Date(log.printTime).getTime();
    return logTime >= start && logTime <= end;
  });
}
