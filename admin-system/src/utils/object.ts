/**
 * 对象操作工具函数
 */

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的新对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }

  // 处理普通对象
  const clonedObj: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone((obj as any)[key]);
    }
  }
  return clonedObj as T;
}

/**
 * 对象合并（深度合并）
 * @param target 目标对象
 * @param sources 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();
  if (!source) {
    return deepMerge(target, ...sources);
  }

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} });
        }
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
}

/**
 * 判断是否为对象
 * @param obj 要判断的值
 * @returns 是否为对象
 */
function isObject(obj: any): obj is Record<string, any> {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}

/**
 * 获取对象指定路径的值
 * @param obj 对象
 * @param path 路径，如 'a.b.c' 或 ['a', 'b', 'c']
 * @param defaultValue 默认值
 * @returns 路径对应的值
 */
export function get<T = any>(
  obj: any,
  path: string | string[],
  defaultValue?: T
): T | undefined {
  const keys = Array.isArray(path) ? path : path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result === undefined ? defaultValue : result;
}

/**
 * 设置对象指定路径的值
 * @param obj 对象
 * @param path 路径，如 'a.b.c' 或 ['a', 'b', 'c']
 * @param value 要设置的值
 * @returns 修改后的对象
 */
export function set<T extends Record<string, any>>(
  obj: T,
  path: string | string[],
  value: any
): T {
  const keys = Array.isArray(path) ? path : path.split('.');
  const lastKey = keys.pop();

  if (!lastKey) {
    return obj;
  }

  let current: any = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
  return obj;
}

/**
 * 删除对象中的空值（null、undefined、空字符串）
 * @param obj 对象
 * @returns 清理后的对象
 */
export function omitEmpty<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * 选择对象的指定属性
 * @param obj 对象
 * @param keys 要选择的键
 * @returns 新对象
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * 排除对象的指定属性
 * @param obj 对象
 * @param keys 要排除的键
 * @returns 新对象
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}
