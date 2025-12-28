/**
 * 打印相关类型定义
 */

/**
 * 条码记录数据
 */
export interface BarcodeRecord {
  key: string;
  id: string;
  projectCode: string;
  factoryCode: string;
  productionLine: string;
  techVersion: string;
  snCode: string;
  code09: string;
  deliveryDate: string;
  templateSnCode: string;
  circuitBoardCode: string;
  accessories: string;
  printStatus: 'pending' | 'printed' | 'completed';
  printCount: number;
  createTime: string;
  remark?: string;
}

/**
 * 查询参数
 */
export interface BarcodeQueryParams {
  projectCode?: string;
  factoryCode?: string;
  productionLine?: string;
  techVersion?: string;
  snCode?: string;
  code09?: string;
  deliveryDateStart?: string;
  deliveryDateEnd?: string;
  templateSnCode?: string;
  circuitBoardCode?: string;
  printStatus?: 'pending' | 'printed' | 'completed';
  page: number;
  size: number;
  offset: number;
  traceId?: string;
}

/**
 * 分页查询响应
 */
export interface BarcodePageResponse {
  content: BarcodeRecord[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * 打印模板类型
 */
export enum PrintTemplateType {
  INNER_BARCODE = 'inner_barcode',     // 内包装条码
  OUTER_BARCODE = 'outer_barcode',     // 外包装条码
  PRODUCT_BARCODE = 'product_barcode', // 本条码
  QR_CODE = 'qr_code',                 // 二维码
}

/**
 * 打印内容数据
 */
export interface PrintContentData {
  /** 条码/二维码内容 */
  code: string;
  /** 标题 */
  title?: string;
  /** 产品名称 */
  productName?: string;
  /** 规格 */
  specification?: string;
  /** 批次号 */
  batchNo?: string;
  /** 生产日期 */
  productionDate?: string;
  /** 有效期 */
  expiryDate?: string;
  /** 数量 */
  quantity?: number;
  /** 单位 */
  unit?: string;
  /** 备注 */
  remark?: string;
  /** 额外数据 */
  [key: string]: any;
}

/**
 * 打印配置
 */
export interface PrintConfig {
  /** 模板类型 */
  templateType: PrintTemplateType;
  /** 打印内容 */
  content: PrintContentData;
  /** 打印份数 */
  copies?: number;
  /** 是否显示预览 */
  showPreview?: boolean;
}

/**
 * 打印日志
 */
export interface PrintLog {
  /** 日志ID */
  id: string;
  /** 打印时间 */
  printTime: string;
  /** 用户ID */
  userId: string;
  /** 用户名 */
  username: string;
  /** 模板类型 */
  templateType: PrintTemplateType;
  /** 打印内容 */
  content: PrintContentData;
  /** 打印份数 */
  copies: number;
  /** 打印状态 */
  status: 'success' | 'failed' | 'cancelled';
  /** 错误信息 */
  errorMessage?: string;
}

/**
 * 打印模板配置
 */
export interface PrintTemplateConfig {
  /** 模板类型 */
  type: PrintTemplateType;
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 必需字段 */
  requiredFields: (keyof PrintContentData)[];
}

/**
 * 打印模板配置映射
 */
export const PRINT_TEMPLATE_CONFIGS: Record<PrintTemplateType, PrintTemplateConfig> = {
  [PrintTemplateType.INNER_BARCODE]: {
    type: PrintTemplateType.INNER_BARCODE,
    name: '内包装条码',
    description: '用于内包装的条码标签',
    requiredFields: ['code', 'productName'],
  },
  [PrintTemplateType.OUTER_BARCODE]: {
    type: PrintTemplateType.OUTER_BARCODE,
    name: '外包装条码',
    description: '用于外包装的条码标签',
    requiredFields: ['code', 'productName', 'quantity'],
  },
  [PrintTemplateType.PRODUCT_BARCODE]: {
    type: PrintTemplateType.PRODUCT_BARCODE,
    name: '本条码',
    description: '产品本身的条码标签',
    requiredFields: ['code', 'productName', 'batchNo'],
  },
  [PrintTemplateType.QR_CODE]: {
    type: PrintTemplateType.QR_CODE,
    name: '二维码',
    description: '产品二维码标签',
    requiredFields: ['code'],
  },
};

/**
 * 获取模板配置
 */
export function getTemplateConfig(type: PrintTemplateType): PrintTemplateConfig {
  return PRINT_TEMPLATE_CONFIGS[type];
}

/**
 * 验证打印内容是否完整
 */
export function validatePrintContent(
  templateType: PrintTemplateType,
  content: PrintContentData
): { valid: boolean; missingFields: string[] } {
  const config = getTemplateConfig(templateType);
  const missingFields: string[] = [];

  for (const field of config.requiredFields) {
    const fieldValue = content[field as keyof PrintContentData];
    if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
      missingFields.push(field as string);
    }
  }

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * 检查打印内容是否包含条码
 */
export function hasBarcode(templateType: PrintTemplateType): boolean {
  return [
    PrintTemplateType.INNER_BARCODE,
    PrintTemplateType.OUTER_BARCODE,
    PrintTemplateType.PRODUCT_BARCODE,
  ].includes(templateType);
}

/**
 * 检查打印内容是否包含二维码
 */
export function hasQRCode(templateType: PrintTemplateType): boolean {
  return templateType === PrintTemplateType.QR_CODE;
}
