/**
 * 工具函数属性测试
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  formatDate,
  formatNumber,
  formatMoney,
  validatePhone,
  validateEmail,
  unique,
  flatten,
  deepClone,
  truncate,
  maskPhone,
} from '../index';

describe('工具函数库', () => {
  // **Feature: admin-management-system, Property 46: 日期格式化一致性**
  // **验证需求: Requirements 10.1**
  describe('Property 46: 日期格式化一致性', () => {
    it('对于任意日期值和格式模板，格式化函数应该返回符合模板的日期字符串', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
          dateObj => {
            const formatted = formatDate(dateObj, 'YYYY-MM-DD');

            // 格式化结果应该匹配模板格式
            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            // 同一日期多次格式化应该得到相同结果
            const formatted2 = formatDate(dateObj, 'YYYY-MM-DD');
            expect(formatted).toBe(formatted2);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('对于任意时间戳，格式化应该返回有效的日期字符串', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 946684800000, max: 1893456000000 }), // 2000-2030
          timestamp => {
            const formatted = formatDate(timestamp, 'YYYY-MM-DD HH:mm:ss');

            // 应该返回完整的日期时间字符串
            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: admin-management-system, Property 47: 数字格式化正确性**
  // **验证需求: Requirements 10.2**
  describe('Property 47: 数字格式化正确性', () => {
    it('对于任意数字值，格式化函数应该正确添加千分位', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 9999999 }), num => {
          const formatted = formatNumber(num);

          // 移除逗号后应该等于原数字
          const parsed = parseInt(formatted.replace(/,/g, ''), 10);
          expect(parsed).toBe(num);

          // 千分位格式应该正确
          if (num >= 1000) {
            expect(formatted).toContain(',');
          }
        }),
        { numRuns: 50 }
      );
    });

    it('对于任意金额，格式化应该保留指定小数位', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 99999, noNaN: true, noDefaultInfinity: true }),
          fc.integer({ min: 0, max: 2 }),
          (amount, decimals) => {
            const formatted = formatMoney(amount, decimals);

            // 应该包含货币符号
            expect(formatted).toContain('¥');

            // 小数位数应该正确
            const parts = formatted.replace('¥', '').replace(/,/g, '').split('.');
            if (parts[1]) {
              expect(parts[1].length).toBe(decimals);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: admin-management-system, Property 48: 数据验证准确性**
  // **验证需求: Requirements 10.3**
  describe('Property 48: 数据验证准确性', () => {
    it('对于任意输入数据，验证函数应该准确判断手机号格式的有效性', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 20 }), str => {
          const isValid = validatePhone(str);

          // 如果验证通过，应该符合手机号格式
          if (isValid) {
            expect(str).toMatch(/^1[3-9]\d{9}$/);
            expect(str.length).toBe(11);
          }

          // 无效格式应该返回false
          if (str.length !== 11 || !str.startsWith('1')) {
            expect(isValid).toBe(false);
          }
        }),
        { numRuns: 50 }
      );
    });

    it('对于任意邮箱字符串，验证函数应该准确判断格式', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 50 }), str => {
          const isValid = validateEmail(str);

          // 如果验证通过，应该包含@和域名
          if (isValid) {
            expect(str).toContain('@');
            expect(str.split('@').length).toBe(2);
          }
        }),
        { numRuns: 50 }
      );
    });

    it('有效的手机号应该通过验证', () => {
      const validPhones = ['13800138000', '15912345678', '18888888888'];
      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it('有效的邮箱应该通过验证', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'admin@test.org'];
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });
  });

  // **Feature: admin-management-system, Property 49: 数组操作正确性**
  // **验证需求: Requirements 10.4**
  describe('Property 49: 数组操作正确性', () => {
    it('对于任意数组，去重操作应该返回正确的结果', () => {
      fc.assert(
        fc.property(fc.array(fc.integer({ min: -100, max: 100 }), { maxLength: 50 }), arr => {
          const uniqueArr = unique(arr);

          // 去重后的数组长度应该小于等于原数组
          expect(uniqueArr.length).toBeLessThanOrEqual(arr.length);

          // 去重后的数组不应该有重复元素
          const set = new Set(uniqueArr);
          expect(set.size).toBe(uniqueArr.length);

          // 原数组的所有元素都应该在去重后的数组中
          arr.forEach(item => {
            expect(uniqueArr).toContain(item);
          });
        }),
        { numRuns: 50 }
      );
    });

    it('对于任意多维数组，扁平化应该返回一维数组', () => {
      fc.assert(
        fc.property(
          fc.array(fc.array(fc.integer({ min: -100, max: 100 }), { maxLength: 10 }), {
            maxLength: 10,
          }),
          arr => {
            const flattened = flatten(arr, 1);

            // 扁平化后应该是一维数组
            expect(Array.isArray(flattened)).toBe(true);

            // 元素总数应该保持不变
            const originalCount = arr.reduce((sum, subArr) => sum + subArr.length, 0);
            expect(flattened.length).toBe(originalCount);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: admin-management-system, Property 50: 对象深拷贝独立性**
  // **验证需求: Requirements 10.5**
  describe('Property 50: 对象深拷贝独立性', () => {
    it('对于任意对象，深拷贝后的对象应该与原对象完全独立', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string({ maxLength: 20 }),
            age: fc.integer({ min: 0, max: 100 }),
            tags: fc.array(fc.string({ maxLength: 10 }), { maxLength: 5 }),
          }),
          obj => {
            const cloned = deepClone(obj);

            // 深拷贝后的对象应该与原对象值相等
            expect(cloned).toEqual(obj);

            // 但不应该是同一个引用
            expect(cloned).not.toBe(obj);

            // 修改克隆对象不应该影响原对象
            if (cloned.tags.length > 0) {
              cloned.tags.push('new-tag');
              expect(obj.tags).not.toContain('new-tag');
            }

            cloned.name = 'modified';
            expect(obj.name).not.toBe('modified');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('深拷贝应该处理嵌套对象', () => {
      fc.assert(
        fc.property(
          fc.record({
            user: fc.record({
              name: fc.string({ maxLength: 20 }),
              profile: fc.record({
                age: fc.integer({ min: 0, max: 100 }),
              }),
            }),
          }),
          obj => {
            const cloned = deepClone(obj);

            // 嵌套对象也应该是独立的
            expect(cloned.user).not.toBe(obj.user);
            expect(cloned.user.profile).not.toBe(obj.user.profile);

            // 修改嵌套对象不应该影响原对象
            cloned.user.profile.age = 999;
            expect(obj.user.profile.age).not.toBe(999);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // **Feature: admin-management-system, Property 51: 字符串处理正确性**
  // **验证需求: Requirements 10.6**
  describe('Property 51: 字符串处理正确性', () => {
    it('对于任意字符串，截取操作应该返回正确的结果', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.integer({ min: 1, max: 50 }),
          (str, length) => {
            const truncated = truncate(str, length);

            // 截取后的长度应该不超过指定长度+后缀长度
            expect(truncated.length).toBeLessThanOrEqual(length + 3);

            // 如果原字符串较短，应该返回原字符串
            if (str.length <= length) {
              expect(truncated).toBe(str);
            } else {
              // 否则应该包含后缀
              expect(truncated).toContain('...');
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('对于任意手机号，脱敏应该保留首尾数字', () => {
      const validPhones = ['13800138000', '15912345678', '18888888888'];

      validPhones.forEach(phone => {
        const masked = maskPhone(phone);

        // 应该包含星号
        expect(masked).toContain('****');

        // 首3位和末4位应该保留
        expect(masked.substring(0, 3)).toBe(phone.substring(0, 3));
        expect(masked.substring(masked.length - 4)).toBe(phone.substring(phone.length - 4));
      });
    });

    it('脱敏后的字符串长度应该与原字符串相同', () => {
      // 生成有效的11位数字字符串
      fc.assert(
        fc.property(
          fc
            .tuple(
              fc.constantFrom('1'),
              fc.constantFrom('3', '4', '5', '6', '7', '8', '9'),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 }),
              fc.integer({ min: 0, max: 9 })
            )
            .map(digits => digits.join('')),
          phone => {
            const masked = maskPhone(phone);
            expect(masked.length).toBe(phone.length);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
