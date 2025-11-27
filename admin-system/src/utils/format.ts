/**
 * 格式化工具函数
 */

/**
 * 日期格式化
 * @param date 日期对象、时间戳或日期字符串
 * @param format 格式模板，如 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return '';
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 数字格式化 - 千分位
 * @param num 数字
 * @returns 格式化后的字符串，如 1,234,567
 */
export function formatNumber(num: number): string {
  if (typeof num !== 'number' || isNaN(num)) {
    return '0';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 金额格式化
 * @param amount 金额
 * @param decimals 小数位数，默认2位
 * @param symbol 货币符号，默认¥
 * @returns 格式化后的金额字符串，如 ¥1,234.56
 */
export function formatMoney(amount: number, decimals: number = 2, symbol: string = '¥'): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${symbol}0.00`;
  }
  
  const fixed = amount.toFixed(decimals);
  const [integer, decimal] = fixed.split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return decimal ? `${symbol}${formattedInteger}.${decimal}` : `${symbol}${formattedInteger}`;
}

/**
 * 百分比格式化
 * @param value 数值（0-1之间）
 * @param decimals 小数位数，默认2位
 * @returns 格式化后的百分比字符串，如 12.34%
 */
export function formatPercent(value: number, decimals: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 文件大小格式化
 * @param bytes 字节数
 * @returns 格式化后的文件大小，如 1.23 MB
 */
export function formatFileSize(bytes: number): string {
  if (typeof bytes !== 'number' || isNaN(bytes) || bytes < 0) {
    return '0 B';
  }
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
