/**
 * 打印服务属性测试
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  PrintTemplateType,
  validatePrintContent,
  hasBarcode,
  hasQRCode,
  getTemplateConfig,
  PRINT_TEMPLATE_CONFIGS,
  type PrintContentData,
  type PrintConfig,
} from '@/types/print';
import {
  createPrintLog,
  validatePrintConfig,
  checkPrintElements,
  savePrintLog,
  getPrintLogs,
  clearPrintLogs,
} from '@/services/print';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 生成有效的打印内容数据
const printContentArbitrary = fc.record({
  code: fc.string({ minLength: 1, maxLength: 50 }),
  title: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  productName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  specification: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  batchNo: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
  productionDate: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
  expiryDate: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
  quantity: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
  unit: fc.option(fc.string({ maxLength: 10 }), { nil: undefined }),
  remark: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
});

// 生成模板类型
const templateTypeArbitrary = fc.constantFrom(
  PrintTemplateType.INNER_BARCODE,
  PrintTemplateType.OUTER_BARCODE,
  PrintTemplateType.PRODUCT_BARCODE,
  PrintTemplateType.QR_CODE
);

describe('打印服务', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  // **Feature: admin-management-system, Property 27: 打印内容完整性**
  // **验证需求: Requirements 6.2**
  describe('Property 27: 打印内容完整性', () => {
    it('对于任意打印内容生成，应该包含条码、二维码等所有必需元素', () => {
      fc.assert(
        fc.property(
          templateTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 50 }),
          (templateType, code) => {
            const content: PrintContentData = {
              code,
              productName: 'Test Product',
              batchNo: 'BATCH001',
              quantity: 10,
            };

            const elements = checkPrintElements(templateType, content);

            // 如果有code，应该有必需元素
            expect(elements.hasCode).toBe(true);

            // 根据模板类型检查条码或二维码
            if (hasBarcode(templateType)) {
              expect(elements.hasBarcode).toBe(true);
              expect(elements.hasQRCode).toBe(false);
            }

            if (hasQRCode(templateType)) {
              expect(elements.hasQRCode).toBe(true);
              expect(elements.hasBarcode).toBe(false);
            }

            // 必需元素应该存在
            expect(elements.hasRequiredElements).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意模板类型，验证函数应该正确检查必需字段', () => {
      fc.assert(
        fc.property(templateTypeArbitrary, printContentArbitrary, (templateType, content) => {
          const validation = validatePrintContent(templateType, content);
          const config = getTemplateConfig(templateType);

          // 检查每个必需字段
          for (const field of config.requiredFields) {
            const fieldValue = content[field];
            const isMissing =
              fieldValue === undefined || fieldValue === null || fieldValue === '';

            if (isMissing) {
              expect(validation.missingFields).toContain(field);
            }
          }

          // 如果没有缺失字段，验证应该通过
          if (validation.missingFields.length === 0) {
            expect(validation.valid).toBe(true);
          } else {
            expect(validation.valid).toBe(false);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('对于空code的打印内容，应该检测到缺少必需元素', () => {
      fc.assert(
        fc.property(templateTypeArbitrary, templateType => {
          const content: PrintContentData = {
            code: '',
            productName: 'Test Product',
          };

          const elements = checkPrintElements(templateType, content);

          // 空code应该导致hasCode为false
          expect(elements.hasCode).toBe(false);
          expect(elements.hasRequiredElements).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    it('条码模板应该正确识别为需要条码', () => {
      const barcodeTemplates = [
        PrintTemplateType.INNER_BARCODE,
        PrintTemplateType.OUTER_BARCODE,
        PrintTemplateType.PRODUCT_BARCODE,
      ];

      barcodeTemplates.forEach(templateType => {
        expect(hasBarcode(templateType)).toBe(true);
        expect(hasQRCode(templateType)).toBe(false);
      });
    });

    it('二维码模板应该正确识别为需要二维码', () => {
      expect(hasBarcode(PrintTemplateType.QR_CODE)).toBe(false);
      expect(hasQRCode(PrintTemplateType.QR_CODE)).toBe(true);
    });
  });
});


  // **Feature: admin-management-system, Property 28: 打印模板匹配**
  // **验证需求: Requirements 6.4**
  describe('Property 28: 打印模板匹配', () => {
    it('对于任意单据类型，系统应该使用对应的打印模板进行渲染', () => {
      fc.assert(
        fc.property(templateTypeArbitrary, templateType => {
          const config = getTemplateConfig(templateType);

          // 每个模板类型应该有对应的配置
          expect(config).toBeDefined();
          expect(config.type).toBe(templateType);
          expect(config.name).toBeTruthy();
          expect(config.description).toBeTruthy();
          expect(Array.isArray(config.requiredFields)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('对于任意模板类型，PRINT_TEMPLATE_CONFIGS应该包含该类型的配置', () => {
      fc.assert(
        fc.property(templateTypeArbitrary, templateType => {
          // 配置映射应该包含该模板类型
          expect(PRINT_TEMPLATE_CONFIGS[templateType]).toBeDefined();

          const config = PRINT_TEMPLATE_CONFIGS[templateType];

          // 配置应该与模板类型匹配
          expect(config.type).toBe(templateType);
        }),
        { numRuns: 100 }
      );
    });

    it('不同模板类型应该有不同的必需字段配置', () => {
      // 内包装条码需要code和productName
      const innerConfig = getTemplateConfig(PrintTemplateType.INNER_BARCODE);
      expect(innerConfig.requiredFields).toContain('code');
      expect(innerConfig.requiredFields).toContain('productName');

      // 外包装条码需要code、productName和quantity
      const outerConfig = getTemplateConfig(PrintTemplateType.OUTER_BARCODE);
      expect(outerConfig.requiredFields).toContain('code');
      expect(outerConfig.requiredFields).toContain('productName');
      expect(outerConfig.requiredFields).toContain('quantity');

      // 本条码需要code、productName和batchNo
      const productConfig = getTemplateConfig(PrintTemplateType.PRODUCT_BARCODE);
      expect(productConfig.requiredFields).toContain('code');
      expect(productConfig.requiredFields).toContain('productName');
      expect(productConfig.requiredFields).toContain('batchNo');

      // 二维码只需要code
      const qrConfig = getTemplateConfig(PrintTemplateType.QR_CODE);
      expect(qrConfig.requiredFields).toContain('code');
    });

    it('对于任意打印配置，验证函数应该根据模板类型检查对应的必需字段', () => {
      fc.assert(
        fc.property(
          templateTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.string({ minLength: 1, maxLength: 30 }),
          fc.integer({ min: 1, max: 1000 }),
          (templateType, code, productName, batchNo, quantity) => {
            // 创建完整的打印内容
            const completeContent: PrintContentData = {
              code,
              productName,
              batchNo,
              quantity,
            };

            const config: PrintConfig = {
              templateType,
              content: completeContent,
              copies: 1,
            };

            const validation = validatePrintConfig(config);

            // 完整内容应该通过验证
            expect(validation.valid).toBe(true);
            expect(validation.errors.length).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于缺少必需字段的打印配置，验证应该失败', () => {
      fc.assert(
        fc.property(templateTypeArbitrary, templateType => {
          // 创建空内容
          const emptyContent: PrintContentData = {
            code: '',
          };

          const config: PrintConfig = {
            templateType,
            content: emptyContent,
            copies: 1,
          };

          const validation = validatePrintConfig(config);

          // 空内容应该验证失败
          expect(validation.valid).toBe(false);
          expect(validation.errors.length).toBeGreaterThan(0);
        }),
        { numRuns: 50 }
      );
    });
  });


  // **Feature: admin-management-system, Property 29: 打印日志记录**
  // **验证需求: Requirements 6.5**
  describe('Property 29: 打印日志记录', () => {
    beforeEach(() => {
      clearPrintLogs();
    });

    it('对于任意打印操作，系统应该记录打印日志包含时间、用户、单据类型等信息', () => {
      fc.assert(
        fc.property(
          templateTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.constantFrom('success', 'failed', 'cancelled') as fc.Arbitrary<
            'success' | 'failed' | 'cancelled'
          >,
          fc.integer({ min: 1, max: 10 }),
          (templateType, code, productName, status, copies) => {
            const config: PrintConfig = {
              templateType,
              content: {
                code,
                productName,
                batchNo: 'BATCH001',
                quantity: 10,
              },
              copies,
            };

            const log = createPrintLog(config, status);

            // 日志应该包含所有必需字段
            expect(log.id).toBeTruthy();
            expect(log.printTime).toBeTruthy();
            expect(log.userId).toBeTruthy();
            expect(log.username).toBeTruthy();
            expect(log.templateType).toBe(templateType);
            expect(log.content).toEqual(config.content);
            expect(log.copies).toBe(copies);
            expect(log.status).toBe(status);

            // 打印时间应该是有效的ISO日期字符串
            expect(() => new Date(log.printTime)).not.toThrow();
            const logDate = new Date(log.printTime);
            expect(logDate.getTime()).not.toBeNaN();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('对于任意打印日志，保存后应该能够正确读取', () => {
      fc.assert(
        fc.property(
          templateTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('success', 'failed', 'cancelled') as fc.Arbitrary<
            'success' | 'failed' | 'cancelled'
          >,
          (templateType, code, status) => {
            // 清空之前的日志
            clearPrintLogs();

            const config: PrintConfig = {
              templateType,
              content: {
                code,
                productName: 'Test Product',
              },
              copies: 1,
            };

            const log = createPrintLog(config, status);
            savePrintLog(log);

            const logs = getPrintLogs();

            // 应该能够读取到保存的日志
            expect(logs.length).toBeGreaterThan(0);
            expect(logs[0].id).toBe(log.id);
            expect(logs[0].templateType).toBe(templateType);
            expect(logs[0].status).toBe(status);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('多次打印操作应该按时间顺序记录日志（最新的在前）', () => {
      clearPrintLogs();

      const configs: PrintConfig[] = [
        {
          templateType: PrintTemplateType.INNER_BARCODE,
          content: { code: 'CODE1', productName: 'Product 1' },
          copies: 1,
        },
        {
          templateType: PrintTemplateType.OUTER_BARCODE,
          content: { code: 'CODE2', productName: 'Product 2', quantity: 10 },
          copies: 2,
        },
        {
          templateType: PrintTemplateType.QR_CODE,
          content: { code: 'CODE3' },
          copies: 3,
        },
      ];

      // 依次保存日志
      configs.forEach(config => {
        const log = createPrintLog(config, 'success');
        savePrintLog(log);
      });

      const logs = getPrintLogs();

      // 应该有3条日志
      expect(logs.length).toBe(3);

      // 最新的日志应该在前面
      expect(logs[0].content.code).toBe('CODE3');
      expect(logs[1].content.code).toBe('CODE2');
      expect(logs[2].content.code).toBe('CODE1');
    });

    it('失败的打印操作应该记录错误信息', () => {
      fc.assert(
        fc.property(
          templateTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 100 }),
          (templateType, errorMessage) => {
            const config: PrintConfig = {
              templateType,
              content: { code: 'TEST', productName: 'Test' },
              copies: 1,
            };

            const log = createPrintLog(config, 'failed', errorMessage);

            // 失败日志应该包含错误信息
            expect(log.status).toBe('failed');
            expect(log.errorMessage).toBe(errorMessage);
          }
        ),
        { numRuns: 50 }
      );
    });

    it('清空日志后应该没有任何日志记录', () => {
      // 先添加一些日志
      const config: PrintConfig = {
        templateType: PrintTemplateType.INNER_BARCODE,
        content: { code: 'TEST', productName: 'Test' },
        copies: 1,
      };

      savePrintLog(createPrintLog(config, 'success'));
      savePrintLog(createPrintLog(config, 'success'));

      // 确认有日志
      expect(getPrintLogs().length).toBeGreaterThan(0);

      // 清空日志
      clearPrintLogs();

      // 应该没有日志了
      expect(getPrintLogs().length).toBe(0);
    });
  });
