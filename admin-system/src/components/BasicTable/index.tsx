/**
 * 基础表格组件
 */
import { Table, Button, Space } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd';
import type { ReactNode } from 'react';

export interface BasicTableProps<T = any> extends Omit<TableProps<T>, 'pagination'> {
  // 数据源
  dataSource?: T[];
  // 列配置
  columns: TableProps<T>['columns'];
  // 加载状态
  loading?: boolean;
  // 分页配置
  pagination?: false | TablePaginationConfig;
  // 行选择配置
  rowSelection?: TableProps<T>['rowSelection'];
  // 刷新回调
  onRefresh?: () => void;
  // 导出回调
  onExport?: () => void;
  // 工具栏额外内容
  toolbarExtra?: ReactNode;
}

export default function BasicTable<T extends Record<string, any>>({
  dataSource = [],
  columns,
  loading = false,
  pagination,
  rowSelection,
  onRefresh,
  onExport,
  toolbarExtra,
  ...restProps
}: BasicTableProps<T>) {
  // 默认分页配置
  const defaultPagination: TablePaginationConfig = {
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    pageSizeOptions: ['10', '20', '50', '100'],
  };

  const finalPagination = pagination === false ? false : { ...defaultPagination, ...pagination };

  return (
    <div className="basic-table">
      {/* 工具栏 */}
      {(onRefresh || onExport || toolbarExtra) && (
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div>{toolbarExtra}</div>
          <Space>
            {onRefresh && (
              <Button icon={<ReloadOutlined />} onClick={onRefresh}>
                刷新
              </Button>
            )}
            {onExport && (
              <Button icon={<DownloadOutlined />} onClick={onExport}>
                导出
              </Button>
            )}
          </Space>
        </div>
      )}

      {/* 表格 */}
      <Table<T>
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        pagination={finalPagination}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        {...restProps}
      />
    </div>
  );
}
