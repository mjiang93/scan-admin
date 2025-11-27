/**
 * 样式工具函数属性测试
 */
import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getOverflowClass,
  getOverflowStyle,
  checkOverflow,
  getAdaptiveClasses,
  isMobile,
  isTablet,
  isDesktop,
  getBreakpoint,
  BREAKPOINTS,
  type ContainerDimensions,
  type OverflowConfig,
} from '../style';

describe('Style Utils Property Tests', () => {
  // **Feature: admin-management-system, Property 61: 内容溢出处理**
  describe('Property 61: 内容溢出处理 - 对于任意内容超出容器的情况，系统应该提供滚动条或自适应处理', () => {
    test('当内容宽度超出容器宽度时，应该返回水平滚动类', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }), // 容器宽度
          fc.integer({ min: 1, max: 2000 }), // 容器高度
          fc.integer({ min: 1, max: 2000 }), // 内容宽度偏移
          (containerWidth, containerHeight, widthOffset) => {
            // 确保内容宽度大于容器宽度
            const contentWidth = containerWidth + widthOffset;
            const contentHeight = containerHeight - 1; // 内容高度不超出
            
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth,
              contentHeight: Math.max(1, contentHeight),
            };
            
            const result = getOverflowClass(dimensions);
            
            // 验证：当内容宽度超出时，应该返回水平滚动类
            expect(result).toBe('overflow-x-auto');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('当内容高度超出容器高度时，应该返回垂直滚动类', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }), // 容器宽度
          fc.integer({ min: 1, max: 2000 }), // 容器高度
          fc.integer({ min: 1, max: 2000 }), // 内容高度偏移
          (containerWidth, containerHeight, heightOffset) => {
            // 确保内容高度大于容器高度
            const contentWidth = containerWidth - 1; // 内容宽度不超出
            const contentHeight = containerHeight + heightOffset;
            
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth: Math.max(1, contentWidth),
              contentHeight,
            };
            
            const result = getOverflowClass(dimensions);
            
            // 验证：当内容高度超出时，应该返回垂直滚动类
            expect(result).toBe('overflow-y-auto');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('当内容宽度和高度都超出容器时，应该返回双向滚动类', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }), // 容器宽度
          fc.integer({ min: 1, max: 2000 }), // 容器高度
          fc.integer({ min: 1, max: 2000 }), // 内容宽度偏移
          fc.integer({ min: 1, max: 2000 }), // 内容高度偏移
          (containerWidth, containerHeight, widthOffset, heightOffset) => {
            // 确保内容宽度和高度都大于容器
            const contentWidth = containerWidth + widthOffset;
            const contentHeight = containerHeight + heightOffset;
            
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth,
              contentHeight,
            };
            
            const result = getOverflowClass(dimensions);
            
            // 验证：当内容宽度和高度都超出时，应该返回双向滚动类
            expect(result).toBe('overflow-auto');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('当内容不超出容器时，应该返回空字符串', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 2000 }), // 容器宽度
          fc.integer({ min: 100, max: 2000 }), // 容器高度
          fc.integer({ min: 1, max: 99 }), // 内容宽度比例 (1-99%)
          fc.integer({ min: 1, max: 99 }), // 内容高度比例 (1-99%)
          (containerWidth, containerHeight, widthPercent, heightPercent) => {
            // 确保内容尺寸小于容器尺寸
            const contentWidth = Math.floor(containerWidth * widthPercent / 100);
            const contentHeight = Math.floor(containerHeight * heightPercent / 100);
            
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth: Math.max(1, contentWidth),
              contentHeight: Math.max(1, contentHeight),
            };
            
            const result = getOverflowClass(dimensions);
            
            // 验证：当内容不超出时，应该返回空字符串
            expect(result).toBe('');
          }
        ),
        { numRuns: 100 }
      );
    });

    test('checkOverflow 应该正确检测溢出状态', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }),
          fc.integer({ min: 1, max: 2000 }),
          fc.integer({ min: 1, max: 4000 }),
          fc.integer({ min: 1, max: 4000 }),
          (containerWidth, containerHeight, contentWidth, contentHeight) => {
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth,
              contentHeight,
            };
            
            const result = checkOverflow(dimensions);
            
            // 验证：溢出检测结果应该与实际比较一致
            expect(result.x).toBe(contentWidth > containerWidth);
            expect(result.y).toBe(contentHeight > containerHeight);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('getAdaptiveClasses 应该返回正确的自适应类名', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 2000 }),
          fc.integer({ min: 1, max: 2000 }),
          fc.integer({ min: 1, max: 4000 }),
          fc.integer({ min: 1, max: 4000 }),
          (containerWidth, containerHeight, contentWidth, contentHeight) => {
            const dimensions: ContainerDimensions = {
              width: containerWidth,
              height: containerHeight,
              contentWidth,
              contentHeight,
            };
            
            const classes = getAdaptiveClasses(dimensions);
            const overflow = checkOverflow(dimensions);
            
            // 验证：类名应该与溢出状态一致
            if (overflow.x || overflow.y) {
              expect(classes).toContain('content-overflow-container');
            } else {
              expect(classes).not.toContain('content-overflow-container');
            }
            
            if (overflow.x) {
              expect(classes).toContain('content-overflow-x');
            }
            
            if (overflow.y) {
              expect(classes).toContain('content-overflow-y');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('getOverflowStyle', () => {
    test('应该根据配置返回正确的样式对象', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('auto', 'hidden', 'scroll', 'visible'),
          fc.constantFrom('auto', 'hidden', 'scroll', 'visible'),
          (overflowX, overflowY) => {
            const config: OverflowConfig = {
              x: overflowX as 'auto' | 'hidden' | 'scroll' | 'visible',
              y: overflowY as 'auto' | 'hidden' | 'scroll' | 'visible',
            };
            
            const style = getOverflowStyle(config);
            
            // 验证：样式对象应该包含正确的溢出属性
            expect(style.overflowX).toBe(overflowX);
            expect(style.overflowY).toBe(overflowY);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('响应式断点函数', () => {
    test('isMobile 应该正确判断移动端', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3000 }),
          (width) => {
            const result = isMobile(width);
            
            // 验证：小于768px应该返回true
            expect(result).toBe(width < BREAKPOINTS.md);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('isTablet 应该正确判断平板', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3000 }),
          (width) => {
            const result = isTablet(width);
            
            // 验证：768px到992px之间应该返回true
            expect(result).toBe(width >= BREAKPOINTS.md && width < BREAKPOINTS.lg);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('isDesktop 应该正确判断桌面端', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3000 }),
          (width) => {
            const result = isDesktop(width);
            
            // 验证：大于等于992px应该返回true
            expect(result).toBe(width >= BREAKPOINTS.lg);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('getBreakpoint 应该返回正确的断点名称', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3000 }),
          (width) => {
            const result = getBreakpoint(width);
            
            // 验证：断点名称应该与宽度范围一致
            if (width < BREAKPOINTS.xs) {
              expect(result).toBe('xs');
            } else if (width < BREAKPOINTS.sm) {
              expect(result).toBe('sm');
            } else if (width < BREAKPOINTS.md) {
              expect(result).toBe('md');
            } else if (width < BREAKPOINTS.lg) {
              expect(result).toBe('lg');
            } else if (width < BREAKPOINTS.xl) {
              expect(result).toBe('xl');
            } else {
              expect(result).toBe('xxl');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('设备类型判断应该互斥', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3000 }),
          (width) => {
            const mobile = isMobile(width);
            const tablet = isTablet(width);
            const desktop = isDesktop(width);
            
            // 验证：设备类型应该互斥（最多只有一个为true）
            const trueCount = [mobile, tablet, desktop].filter(Boolean).length;
            expect(trueCount).toBeLessThanOrEqual(1);
            
            // 验证：至少有一个设备类型为true
            expect(mobile || tablet || desktop).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
