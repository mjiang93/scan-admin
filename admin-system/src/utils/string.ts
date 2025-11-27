/**
 * 字符串处理工具函数
 */

/**
 * 字符串截取（支持中文）
 * @param str 字符串
 * @param length 截取长度
 * @param suffix 后缀，默认'...'
 * @returns 截取后的字符串
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  if (str.length <= length) {
    return str;
  }

  return str.substring(0, length) + suffix;
}

/**
 * 手机号脱敏
 * @param phone 手机号
 * @returns 脱敏后的手机号，如 138****5678
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  if (phone.length !== 11) {
    return phone;
  }

  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 邮箱脱敏
 * @param email 邮箱
 * @returns 脱敏后的邮箱，如 abc***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }

  const visibleLength = Math.min(3, username.length);
  const maskedUsername = username.substring(0, visibleLength) + '***';

  return `${maskedUsername}@${domain}`;
}

/**
 * 身份证号脱敏
 * @param idCard 身份证号
 * @returns 脱敏后的身份证号，如 110***********1234
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || typeof idCard !== 'string') {
    return '';
  }

  if (idCard.length !== 18) {
    return idCard;
  }

  return idCard.replace(/(\d{3})\d{11}(\d{4})/, '$1***********$2');
}

/**
 * 银行卡号脱敏
 * @param cardNo 银行卡号
 * @returns 脱敏后的银行卡号，如 6222 **** **** 1234
 */
export function maskBankCard(cardNo: string): string {
  if (!cardNo || typeof cardNo !== 'string') {
    return '';
  }

  const cleaned = cardNo.replace(/\s/g, '');
  if (cleaned.length < 8) {
    return cardNo;
  }

  const first = cleaned.substring(0, 4);
  const last = cleaned.substring(cleaned.length - 4);
  const middle = '*'.repeat(Math.min(cleaned.length - 8, 8));

  return `${first} ${middle} ${last}`;
}

/**
 * 驼峰转下划线
 * @param str 驼峰字符串
 * @returns 下划线字符串
 */
export function camelToSnake(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * 下划线转驼峰
 * @param str 下划线字符串
 * @returns 驼峰字符串
 */
export function snakeToCamel(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 首字母大写
 * @param str 字符串
 * @returns 首字母大写的字符串
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 生成随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export function randomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * 移除HTML标签
 * @param html HTML字符串
 * @returns 纯文本
 */
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return html.replace(/<[^>]*>/g, '');
}
