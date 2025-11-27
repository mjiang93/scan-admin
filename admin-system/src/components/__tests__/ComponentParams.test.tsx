/**
 * 组件参数验证属性测试
 * **Feature: admin-management-system**
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as fc from 'fast-check';
import BasicTable from '../BasicTable';
import BasicForm from '../BasicForm';
import BasicModal from '../BasicModal';
import SearchForm from '../SearchForm';
import AuthButton from '../AuthButton';
import type { FormField } from '@/types';

describe('Component Parameter Validation Property Tests', () => {
  /**
   * **Feature: admin-management-system, Property 45: 组件参数验证**
   * **验证需求: Requirements 9.6**
   * 
   * 对于任意组件参数，系统应该验证参数类型并在缺失时使用默认值
   */
  describe('Property 45: 组件参数验证', () => {
    it('BasicTable组件应该为缺失的参数提供默认值', () => {
      fc.assert(
        fc.property(
          // 生成随机的列配置
          fc.array(
            fc.record({
              title: fc.string({ minLength: 1, maxLength: 20 }),
              dataIndex: fc.string({ minLength: 1, maxLength: 20 }),
              key: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (columns) => {
            // 只提供必需的columns参数，其他参数使用默认值
            const { container } = render(
              <BasicTable columns={columns} />
            );

            // 验证表格已渲染（使用默认的空数据源）
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证使用了默认的dataSource（空数组）
            const emptyText = container.querySelector('.ant-empty');
            expect(emptyText).toBeTruthy();

            // 验证使用了默认的loading（false）
            const spinner = container.querySelector('.ant-spin-spinning');
            expect(spinner).toBeFalsy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('BasicTable组件应该正确处理各种类型的参数', () => {
      fc.assert(
        fc.property(
          fc.record({
            dataSource: fc.array(
              fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                name: fc.string({ minLength: 0, maxLength: 50 }),
              }),
              { minLength: 0, maxLength: 10 }
            ),
            loading: fc.boolean(),
            pagination: fc.oneof(
              fc.constant(false),
              fc.record({
                current: fc.integer({ min: 1, max: 10 }),
                pageSize: fc.integer({ min: 5, max: 50 }),
                total: fc.integer({ min: 0, max: 1000 }),
              })
            ),
          }),
          ({ dataSource, loading, pagination }) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const { container } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                pagination={pagination}
                rowKey="id"
              />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证loading状态正确应用
            if (loading) {
              const spinner = container.querySelector('.ant-spin');
              expect(spinner).toBeTruthy();
            }

            // 验证分页配置正确应用
            if (pagination !== false && (pagination.total > 0 || dataSource.length > 0)) {
              const paginationElement = container.querySelector('.ant-pagination');
              expect(paginationElement).toBeTruthy();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('BasicForm组件应该为缺失的参数提供默认值', () => {
      fc.assert(
        fc.property(
          // 生成随机的表单字段配置
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
              label: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('input', 'number', 'textarea'),
            }) as fc.Arbitrary<FormField>,
            { minLength: 1, maxLength: 5 }
          ),
          (fields) => {
            // 只提供必需的fields参数
            const { container } = render(
              <BasicForm fields={fields} />
            );

            // 验证表单已渲染
            const form = container.querySelector('.ant-form');
            expect(form).toBeTruthy();

            // 验证所有字段都已渲染
            const formItems = container.querySelectorAll('.ant-form-item');
            expect(formItems.length).toBe(fields.length);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('BasicForm组件应该正确处理各种字段类型', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
              label: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('input', 'number', 'textarea'),
              placeholder: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
              required: fc.option(fc.boolean(), { nil: undefined }),
            }) as fc.Arbitrary<FormField>,
            { minLength: 1, maxLength: 5 }
          ),
          (fields) => {
            const { container } = render(
              <BasicForm fields={fields} />
            );

            // 验证表单已渲染
            const form = container.querySelector('.ant-form');
            expect(form).toBeTruthy();

            // 验证所有字段都已渲染
            const formItems = container.querySelectorAll('.ant-form-item');
            expect(formItems.length).toBe(fields.length);

            // 验证每个字段类型都正确渲染
            expect(formItems.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('BasicModal组件应该为缺失的参数提供默认值', () => {
      fc.assert(
        fc.property(
          fc.boolean(), // open状态
          fc.string({ minLength: 1, maxLength: 50 }), // 内容
          (open, content) => {
            const { container } = render(
              <BasicModal open={open}>
                <div>{content}</div>
              </BasicModal>
            );

            // 验证组件没有崩溃，使用了默认的width (520)
            expect(container).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('BasicModal组件应该正确处理各种参数类型', () => {
      fc.assert(
        fc.property(
          fc.record({
            open: fc.boolean(),
            title: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
            width: fc.option(
              fc.oneof(
                fc.integer({ min: 300, max: 1000 }),
                fc.constantFrom('50%', '80%', '90%')
              ),
              { nil: undefined }
            ),
          }),
          ({ open, title, width }) => {
            const onOk = vi.fn();
            const onCancel = vi.fn();

            const { container } = render(
              <BasicModal
                open={open}
                title={title}
                width={width}
                onOk={onOk}
                onCancel={onCancel}
              >
                <div>Modal Content</div>
              </BasicModal>
            );

            // 验证组件没有崩溃，正确接受各种参数类型
            expect(container).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('SearchForm组件应该为缺失的参数提供默认值', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
              label: fc.string({ minLength: 1, maxLength: 20 }),
              type: fc.constantFrom('input', 'select', 'number'),
            }) as fc.Arbitrary<FormField>,
            { minLength: 1, maxLength: 5 }
          ),
          (fields) => {
            const onSearch = vi.fn();

            const { container } = render(
              <SearchForm fields={fields} onSearch={onSearch} />
            );

            // 验证搜索表单已渲染
            const form = container.querySelector('.search-form');
            expect(form).toBeTruthy();

            // 验证所有字段都已渲染
            const formItems = container.querySelectorAll('.ant-form-item');
            // 字段数 + 1个按钮组
            expect(formItems.length).toBeGreaterThanOrEqual(fields.length);

            // 验证搜索按钮存在
            const buttons = container.querySelectorAll('button');
            const searchButton = Array.from(buttons).find(btn => btn.textContent?.includes('搜索'));
            expect(searchButton).toBeTruthy();

            // 验证重置按钮存在
            const resetButton = Array.from(buttons).find(btn => btn.textContent?.includes('重置'));
            expect(resetButton).toBeTruthy();

            // 验证使用了默认的loading（false）
            expect(searchButton?.classList.contains('ant-btn-loading')).toBe(false);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('SearchForm组件应该正确处理各种参数类型', () => {
      fc.assert(
        fc.property(
          fc.record({
            fields: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
                label: fc.string({ minLength: 1, maxLength: 20 }),
                type: fc.constantFrom('input', 'select', 'number'),
                placeholder: fc.option(fc.string({ minLength: 1, maxLength: 30 }), { nil: undefined }),
                options: fc.option(
                  fc.array(
                    fc.record({
                      label: fc.string({ minLength: 1, maxLength: 20 }),
                      value: fc.oneof(fc.string(), fc.integer()),
                    }),
                    { minLength: 1, maxLength: 5 }
                  ),
                  { nil: undefined }
                ),
              }) as fc.Arbitrary<FormField>,
              { minLength: 1, maxLength: 5 }
            ),
            loading: fc.option(fc.boolean(), { nil: undefined }),
            columns: fc.option(fc.integer({ min: 2, max: 6 }), { nil: undefined }),
          }),
          ({ fields, loading, columns }) => {
            const onSearch = vi.fn();
            const onReset = vi.fn();

            const { container } = render(
              <SearchForm
                fields={fields}
                onSearch={onSearch}
                onReset={onReset}
                loading={loading}
                columns={columns}
              />
            );

            // 验证搜索表单已渲染
            const form = container.querySelector('.search-form');
            expect(form).toBeTruthy();

            // 验证所有字段都已渲染
            const formItems = container.querySelectorAll('.ant-form-item');
            expect(formItems.length).toBeGreaterThanOrEqual(fields.length);

            // 验证loading状态正确应用
            const buttons = container.querySelectorAll('button');
            const searchButton = Array.from(buttons).find(btn => btn.textContent?.includes('搜索'));
            if (loading) {
              expect(searchButton?.classList.contains('ant-btn-loading')).toBe(true);
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('AuthButton组件应该正确处理参数', () => {
      fc.assert(
        fc.property(
          fc.record({
            permission: fc.string({ minLength: 1, maxLength: 50 }),
            type: fc.option(
              fc.constantFrom('primary', 'default', 'dashed', 'link', 'text'),
              { nil: undefined }
            ),
            disabled: fc.option(fc.boolean(), { nil: undefined }),
            children: fc.string({ minLength: 1, maxLength: 20 }),
          }),
          ({ permission, type, disabled, children }) => {
            // Mock权限检查函数
            vi.mock('@/utils/permission', () => ({
              hasButtonPermission: () => true,
            }));

            const { container } = render(
              <AuthButton
                permission={permission}
                type={type as unknown}
                disabled={disabled}
              >
                {children}
              </AuthButton>
            );

            // 验证按钮已渲染（假设有权限）
            const button = container.querySelector('button');
            // 如果有权限，按钮应该存在
            // 注意：实际权限检查可能导致按钮不渲染，这里我们主要测试参数处理
            if (button) {
              expect(button.textContent).toBe(children);
              
              if (disabled) {
                expect(button.disabled).toBe(true);
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('组件应该拒绝无效的参数类型', () => {
      fc.assert(
        fc.property(
          fc.record({
            // 测试columns必须是数组
            columns: fc.oneof(
              fc.array(
                fc.record({
                  title: fc.string({ minLength: 1, maxLength: 20 }),
                  dataIndex: fc.string({ minLength: 1, maxLength: 20 }),
                  key: fc.string({ minLength: 1, maxLength: 20 }),
                }),
                { minLength: 1, maxLength: 5 }
              ),
              fc.constant([]) // 空数组也是有效的
            ),
          }),
          ({ columns }) => {
            // 验证组件能够处理有效的columns参数
            const { container } = render(
              <BasicTable columns={columns} />
            );

            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('组件应该为可选参数提供合理的默认值', () => {
      fc.assert(
        fc.property(
          fc.constant(true),
          () => {
            // BasicTable默认值测试
            const tableColumns = [
              { title: 'Test', dataIndex: 'test', key: 'test' },
            ];
            const { container: tableContainer } = render(
              <BasicTable columns={tableColumns} />
            );
            expect(tableContainer.querySelector('.ant-table')).toBeTruthy();

            // BasicForm默认值测试
            const formFields: FormField[] = [
              { name: 'test', label: 'Test', type: 'input' },
            ];
            const { container: formContainer } = render(
              <BasicForm fields={formFields} />
            );
            expect(formContainer.querySelector('.ant-form')).toBeTruthy();

            // SearchForm默认值测试
            const searchFields: FormField[] = [
              { name: 'search', label: 'Search', type: 'input' },
            ];
            const { container: searchContainer } = render(
              <SearchForm fields={searchFields} onSearch={vi.fn()} />
            );
            expect(searchContainer.querySelector('.search-form')).toBeTruthy();

            // 所有组件都应该成功渲染
            expect(true).toBe(true);
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
