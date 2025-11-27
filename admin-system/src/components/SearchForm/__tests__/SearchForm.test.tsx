/**
 * SearchForm 组件测试
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Form } from 'antd';
import * as fc from 'fast-check';
import SearchForm, { 
  combineSearchConditions, 
  validateSearchConditions,
  renderSearchField 
} from '../index';
import type { FormField } from '@/types';

describe('SearchForm', () => {
  // 每个测试后清理
  afterEach(() => {
    cleanup();
  });

  // **Feature: admin-management-system, Property 43: 搜索条件组合**
  it('should support multiple search condition combinations for any search component instance', async () => {
    await fc.assert(
      fc.asyncProperty(
        // 生成搜索字段配置 - 使用简单的字母数字字符
        fc.integer({ min: 1, max: 4 }).chain(count => {
          const fieldTypes = ['input', 'select', 'number'] as const;
          return fc.tuple(
            ...Array.from({ length: count }, (_, i) => 
              fc.record({
                name: fc.constant(`field${i}`),
                label: fc.constantFrom('Name', 'Status', 'Count', 'Type').map(l => `${l}${i}`),
                type: fc.constantFrom(...fieldTypes),
              })
            )
          );
        }).map(fields => {
          return fields.map((field, index) => {
            const fieldConfig: FormField = {
              ...field,
              name: `field${index}`,
            };
            // 为 select 类型添加选项
            if (field.type === 'select') {
              fieldConfig.options = [
                { label: 'Option A', value: 'a' },
                { label: 'Option B', value: 'b' },
                { label: 'Option C', value: 'c' },
              ];
            }
            return fieldConfig;
          });
        }),
        async (fields) => {
          // 清理之前的渲染
          cleanup();
          
          const onSearchMock = vi.fn();
          
          const TestComponent = () => {
            const [form] = Form.useForm();
            return (
              <SearchForm 
                fields={fields} 
                onSearch={onSearchMock}
                form={form}
              />
            );
          };
          
          const { container, getAllByText, unmount } = render(<TestComponent />);

          try {
            // 验证1: 所有字段都应该被渲染 - 通过检查表单项元素
            for (const field of fields) {
              const formItem = container.querySelector(`[id="${field.name}"]`) || 
                              container.querySelector(`[name="${field.name}"]`);
              expect(formItem).toBeTruthy();
            }

            // 验证2: 搜索按钮应该存在
            const searchButtons = getAllByText('搜索');
            expect(searchButtons.length).toBeGreaterThan(0);

            // 验证3: 重置按钮应该存在
            const resetButtons = getAllByText('重置');
            expect(resetButtons.length).toBeGreaterThan(0);

            // 验证4: 点击搜索按钮应该触发 onSearch 回调
            fireEvent.click(searchButtons[0]);
            
            await waitFor(() => {
              expect(onSearchMock).toHaveBeenCalled();
            });

            // 验证5: 搜索回调应该返回组合后的条件（过滤空值）
            const lastCall = onSearchMock.mock.calls[onSearchMock.mock.calls.length - 1];
            const searchResult = lastCall[0];
            
            // 结果应该是一个对象
            expect(typeof searchResult).toBe('object');
            
            // 结果中不应该包含 undefined、null 或空字符串
            for (const value of Object.values(searchResult)) {
              expect(value).not.toBe(undefined);
              expect(value).not.toBe(null);
              expect(value).not.toBe('');
            }
          } finally {
            unmount();
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  // 属性测试：combineSearchConditions 函数
  it('should filter out empty values when combining search conditions', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1, maxLength: 10 }).filter(s => /^[a-zA-Z][a-zA-Z0-9]*$/.test(s)),
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.constant(undefined),
            fc.constant(null),
            fc.constant('')
          )
        ),
        (values) => {
          const result = combineSearchConditions(values);
          
          // 结果中不应该包含空值
          for (const value of Object.values(result)) {
            expect(value).not.toBe(undefined);
            expect(value).not.toBe(null);
            expect(value).not.toBe('');
          }
          
          // 所有非空值都应该被保留
          for (const [key, value] of Object.entries(values)) {
            if (value !== undefined && value !== null && value !== '') {
              expect(result[key]).toBe(value);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // 单元测试：基本渲染
  it('should render search form with given fields', () => {
    const fields: FormField[] = [
      { name: 'keyword', label: '关键词', type: 'input' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ]},
    ];

    const onSearch = vi.fn();
    const { getByText, container } = render(
      <SearchForm fields={fields} onSearch={onSearch} />
    );

    expect(getByText('关键词')).toBeTruthy();
    expect(getByText('状态')).toBeTruthy();
    expect(getByText('搜索')).toBeTruthy();
    expect(getByText('重置')).toBeTruthy();
  });

  // 单元测试：搜索功能
  it('should call onSearch when search button is clicked', async () => {
    const fields: FormField[] = [
      { name: 'keyword', label: '关键词', type: 'input' },
    ];

    const onSearch = vi.fn();
    const { getByText } = render(
      <SearchForm fields={fields} onSearch={onSearch} />
    );

    fireEvent.click(getByText('搜索'));

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalled();
    });
  });

  // 单元测试：重置功能
  it('should call onReset when reset button is clicked', async () => {
    const fields: FormField[] = [
      { name: 'keyword', label: '关键词', type: 'input' },
    ];

    const onSearch = vi.fn();
    const onReset = vi.fn();
    const { getByText } = render(
      <SearchForm fields={fields} onSearch={onSearch} onReset={onReset} />
    );

    fireEvent.click(getByText('重置'));

    await waitFor(() => {
      expect(onReset).toHaveBeenCalled();
    });
  });

  // 单元测试：不同字段类型渲染
  it('should render different field types correctly', () => {
    const fields: FormField[] = [
      { name: 'input', label: 'Input', type: 'input' },
      { name: 'select', label: 'Select', type: 'select', options: [{ label: 'A', value: 'a' }] },
      { name: 'number', label: 'Number', type: 'number' },
    ];

    const onSearch = vi.fn();
    const { getByText } = render(
      <SearchForm fields={fields} onSearch={onSearch} />
    );

    expect(getByText('Input')).toBeTruthy();
    expect(getByText('Select')).toBeTruthy();
    expect(getByText('Number')).toBeTruthy();
  });

  // 单元测试：加载状态
  it('should show loading state on search button', () => {
    const fields: FormField[] = [
      { name: 'keyword', label: '关键词', type: 'input' },
    ];

    const onSearch = vi.fn();
    const { container } = render(
      <SearchForm fields={fields} onSearch={onSearch} loading={true} />
    );

    // 检查按钮是否有 loading 状态
    const loadingButton = container.querySelector('.ant-btn-loading');
    expect(loadingButton).toBeTruthy();
  });

  // 单元测试：combineSearchConditions 函数
  it('should combine search conditions correctly', () => {
    const values = {
      keyword: 'test',
      status: 1,
      empty: '',
      nullValue: null,
      undefinedValue: undefined,
    };

    const result = combineSearchConditions(values);

    expect(result).toEqual({
      keyword: 'test',
      status: 1,
    });
  });

  // 单元测试：validateSearchConditions 函数
  it('should validate search conditions correctly', () => {
    const fields: FormField[] = [
      { name: 'keyword', label: '关键词', type: 'input' },
      { name: 'count', label: '数量', type: 'number' },
      { name: 'status', label: '状态', type: 'select', options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ]},
    ];

    // 有效的搜索条件
    expect(validateSearchConditions({ keyword: 'test', count: 10, status: 1 }, fields)).toBe(true);
    
    // 空值应该通过验证
    expect(validateSearchConditions({ keyword: '', count: undefined }, fields)).toBe(true);
  });
});
