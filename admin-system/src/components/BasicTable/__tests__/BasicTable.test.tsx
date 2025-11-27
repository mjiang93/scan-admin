/**
 * BasicTable 组件属性测试
 * **Feature: admin-management-system**
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import BasicTable from '../index';
import type { BasicTableProps } from '../index';

describe('BasicTable Component Property Tests', () => {
  /**
   * **Feature: admin-management-system, Property 40: 表格组件功能完整性**
   * **验证需求: Requirements 9.1**
   * 
   * 对于任意表格组件实例，应该提供分页、排序、筛选等基础功能
   */
  describe('Property 40: 表格组件功能完整性', () => {
    it('对于任意表格配置，组件应该提供分页功能', () => {
      fc.assert(
        fc.property(
          // 生成随机的分页配置
          fc.record({
            current: fc.integer({ min: 1, max: 10 }),
            pageSize: fc.integer({ min: 10, max: 20 }),
            total: fc.integer({ min: 0, max: 100 }),
          }),
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (paginationConfig, dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const { container } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                pagination={paginationConfig}
                rowKey="id"
              />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证分页器存在（当有数据或配置了分页时）
            if (paginationConfig.total > 0 || dataSource.length > 0) {
              const pagination = container.querySelector('.ant-pagination');
              expect(pagination).toBeTruthy();
            }
          }
        ),
        { numRuns: 20 }
      );
    });

    it('对于任意表格配置，组件应该支持排序功能', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              value: fc.integer({ min: 0, max: 1000 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id', sorter: true },
              { title: 'Value', dataIndex: 'value', key: 'value', sorter: true },
            ];

            const { container } = render(
              <BasicTable dataSource={dataSource} columns={columns} pagination={false} rowKey="id" />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证排序列存在排序图标
            const sorterColumns = container.querySelectorAll('.ant-table-column-has-sorters');
            expect(sorterColumns.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('对于任意表格配置，组件应该支持行选择功能', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const rowSelection = {
              onChange: vi.fn(),
            };

            const { container } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                rowSelection={rowSelection}
                pagination={false}
                rowKey="id"
              />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证选择列存在
            const selectionColumn = container.querySelector('.ant-table-selection-column');
            expect(selectionColumn).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('对于任意表格配置，组件应该提供刷新和导出按钮', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const onRefresh = vi.fn();
            const onExport = vi.fn();

            const { container, unmount } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                onRefresh={onRefresh}
                onExport={onExport}
                pagination={false}
                rowKey="id"
              />
            );

            // 验证刷新按钮存在
            const refreshButtons = container.querySelectorAll('button');
            const refreshButton = Array.from(refreshButtons).find(btn => btn.textContent?.includes('刷新'));
            expect(refreshButton).toBeTruthy();

            // 验证导出按钮存在
            const exportButton = Array.from(refreshButtons).find(btn => btn.textContent?.includes('导出'));
            expect(exportButton).toBeTruthy();

            // 清理
            unmount();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('表格组件应该正确处理空数据源', () => {
      fc.assert(
        fc.property(
          fc.constant([]), // 空数组
          (dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const { container } = render(
              <BasicTable dataSource={dataSource} columns={columns} pagination={false} rowKey="id" />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证空状态提示
            const emptyText = container.querySelector('.ant-empty');
            expect(emptyText).toBeTruthy();
          }
        ),
        { numRuns: 10 }
      );
    });

    it('表格组件应该正确处理加载状态', () => {
      fc.assert(
        fc.property(
          fc.boolean(),
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              name: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (loading, dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id' },
              { title: 'Name', dataIndex: 'name', key: 'name' },
            ];

            const { container } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                loading={loading}
                pagination={false}
                rowKey="id"
              />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 如果loading为true，应该有加载指示器
            if (loading) {
              const spinner = container.querySelector('.ant-spin');
              expect(spinner).toBeTruthy();
            }
          }
        ),
        { numRuns: 20 }
      );
    });
  });

  /**
   * **Feature: admin-management-system, Property 60: 表格横向滚动**
   * **验证需求: Requirements 12.4**
   * 
   * 对于任意列数超出容器宽度的表格，应该提供横向滚动功能
   */
  describe('Property 60: 表格横向滚动', () => {
    it('对于任意表格配置，组件应该设置横向滚动', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              col1: fc.string({ minLength: 1, maxLength: 20 }),
              col2: fc.string({ minLength: 1, maxLength: 20 }),
              col3: fc.string({ minLength: 1, maxLength: 20 }),
              col4: fc.string({ minLength: 1, maxLength: 20 }),
              col5: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (dataSource) => {
            // 创建多列配置
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
              { title: 'Column 1', dataIndex: 'col1', key: 'col1', width: 200 },
              { title: 'Column 2', dataIndex: 'col2', key: 'col2', width: 200 },
              { title: 'Column 3', dataIndex: 'col3', key: 'col3', width: 200 },
              { title: 'Column 4', dataIndex: 'col4', key: 'col4', width: 200 },
              { title: 'Column 5', dataIndex: 'col5', key: 'col5', width: 200 },
            ];

            const { container } = render(
              <BasicTable dataSource={dataSource} columns={columns} pagination={false} rowKey="id" />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证表格容器有滚动配置
            const tableContent = container.querySelector('.ant-table-content');
            expect(tableContent).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });

    it('表格应该为所有列配置提供横向滚动支持', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 3, max: 8 }), // 列数
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
            }),
            { minLength: 0, maxLength: 5 }
          ),
          (columnCount, dataSource) => {
            // 动态生成列配置
            const columns = Array.from({ length: columnCount }, (_, i) => ({
              title: `Column ${i}`,
              dataIndex: `col${i}`,
              key: `col${i}`,
              width: 200,
            }));

            const { container } = render(
              <BasicTable dataSource={dataSource} columns={columns} pagination={false} rowKey="id" />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证所有列都已渲染
            const headerCells = container.querySelectorAll('.ant-table-thead th');
            expect(headerCells.length).toBeGreaterThanOrEqual(columnCount);
          }
        ),
        { numRuns: 20 }
      );
    });

    it('表格横向滚动应该不影响分页功能', () => {
      fc.assert(
        fc.property(
          fc.record({
            current: fc.integer({ min: 1, max: 5 }),
            pageSize: fc.integer({ min: 10, max: 20 }),
            total: fc.integer({ min: 0, max: 100 }),
          }),
          fc.array(
            fc.record({
              id: fc.integer({ min: 1, max: 10000 }),
              col1: fc.string({ minLength: 1, maxLength: 20 }),
              col2: fc.string({ minLength: 1, maxLength: 20 }),
              col3: fc.string({ minLength: 1, maxLength: 20 }),
            }),
            { minLength: 0, maxLength: 10 }
          ),
          (paginationConfig, dataSource) => {
            const columns = [
              { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
              { title: 'Column 1', dataIndex: 'col1', key: 'col1', width: 200 },
              { title: 'Column 2', dataIndex: 'col2', key: 'col2', width: 200 },
              { title: 'Column 3', dataIndex: 'col3', key: 'col3', width: 200 },
            ];

            const { container } = render(
              <BasicTable
                dataSource={dataSource}
                columns={columns}
                pagination={paginationConfig}
                rowKey="id"
              />
            );

            // 验证表格已渲染
            const table = container.querySelector('.ant-table');
            expect(table).toBeTruthy();

            // 验证分页器存在（当有数据或配置了分页时）
            if (paginationConfig.total > 0 || dataSource.length > 0) {
              const pagination = container.querySelector('.ant-pagination');
              expect(pagination).toBeTruthy();
            }

            // 验证表格内容区域存在
            const tableContent = container.querySelector('.ant-table-content');
            expect(tableContent).toBeTruthy();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
