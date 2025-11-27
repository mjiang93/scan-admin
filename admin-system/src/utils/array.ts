/**
 * 数组操作工具函数
 */

/**
 * 数组去重
 * @param arr 数组
 * @returns 去重后的数组
 */
export function unique<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  return Array.from(new Set(arr));
}

/**
 * 数组扁平化
 * @param arr 多维数组
 * @param depth 扁平化深度，默认1
 * @returns 扁平化后的数组
 */
export function flatten<T>(arr: any[], depth: number = 1): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  if (depth <= 0) {
    return arr;
  }
  
  return arr.reduce((acc, val) => {
    if (Array.isArray(val)) {
      acc.push(...flatten(val, depth - 1));
    } else {
      acc.push(val);
    }
    return acc;
  }, []);
}

/**
 * 数组分组
 * @param arr 数组
 * @param key 分组键或分组函数
 * @returns 分组后的对象
 */
export function groupBy<T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  if (!Array.isArray(arr)) {
    return {};
  }
  
  return arr.reduce((acc, item) => {
    const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * 数组分块
 * @param arr 数组
 * @param size 每块大小
 * @returns 分块后的二维数组
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (!Array.isArray(arr) || size <= 0) {
    return [];
  }
  
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * 数组求和
 * @param arr 数字数组
 * @returns 总和
 */
export function sum(arr: number[]): number {
  if (!Array.isArray(arr)) {
    return 0;
  }
  return arr.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
}

/**
 * 数组求平均值
 * @param arr 数字数组
 * @returns 平均值
 */
export function average(arr: number[]): number {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }
  return sum(arr) / arr.length;
}

/**
 * 数组随机打乱
 * @param arr 数组
 * @returns 打乱后的新数组
 */
export function shuffle<T>(arr: T[]): T[] {
  if (!Array.isArray(arr)) {
    return [];
  }
  
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
