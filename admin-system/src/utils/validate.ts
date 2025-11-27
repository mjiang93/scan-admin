/**
 * 数据验证工具函数
 */

/**
 * 验证手机号（中国大陆）
 * @param phone 手机号
 * @returns 是否有效
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneReg = /^1[3-9]\d{9}$/;
  return phoneReg.test(phone);
}

/**
 * 验证邮箱
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailReg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailReg.test(email);
}

/**
 * 验证身份证号（中国大陆）
 * @param idCard 身份证号
 * @returns 是否有效
 */
export function validateIdCard(idCard: string): boolean {
  if (!idCard || typeof idCard !== 'string') {
    return false;
  }
  
  // 18位身份证号码正则
  const idCardReg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  
  if (!idCardReg.test(idCard)) {
    return false;
  }
  
  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i];
  }
  
  const checkCode = checkCodes[sum % 11];
  return idCard[17].toUpperCase() === checkCode;
}

/**
 * 验证URL
 * @param url URL地址
 * @returns 是否有效
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证密码强度
 * @param password 密码
 * @param minLength 最小长度，默认8
 * @returns 是否符合强度要求（包含大小写字母、数字）
 */
export function validatePassword(password: string, minLength: number = 8): boolean {
  if (!password || typeof password !== 'string' || password.length < minLength) {
    return false;
  }
  
  // 至少包含大写字母、小写字母、数字
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber;
}

/**
 * 验证用户名
 * @param username 用户名
 * @returns 是否有效（4-20位字母、数字、下划线）
 */
export function validateUsername(username: string): boolean {
  if (!username || typeof username !== 'string') {
    return false;
  }
  const usernameReg = /^[a-zA-Z0-9_]{4,20}$/;
  return usernameReg.test(username);
}
