/**
 * 打印机选择弹窗组件
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Table, Tag, Input, Select, Space, Button, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { usePrinter } from '@/hooks/usePrinter';
import type { PrinterInfo } from '@/types/print';
import type { ColumnsType } from 'antd/es/table';
import './index.css';

const { Search } = Input;
const { Option } = Select;

export interface PrinterSelectModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onCancel: () => void;
  /** 选择打印机回调 */
  onSelect: (printer: PrinterInfo) => void;
  /** 弹窗标题 */
  title?: string;
  /** 是否只显示在线打印机 */
  onlineOnly?: boolean;
  /** 部门筛选 */
  department?: string;
}

/**
 * 打印机选择弹窗
 */
export const PrinterSelectModal: React.FC<PrinterSelectModalProps> = ({
  visible,
  onCancel,
  onSelect,
  title = '选择打印机',
  onlineOnly = false,
  department,
}) => {
  const { printers, loading, total, fetchPrinters } = usePrinter();
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>(
    onlineOnly ? 'ONLINE' : 'ALL'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 加载打印机列表
  useEffect(() => {
    if (visible) {
      fetchPrinters({
        pageNum: 1,
        pageSize,
        status: statusFilter,
        department,
        keyword: keyword.trim() || undefined,
      });
    }
  }, [visible]); // 只在 visible 变化时触发

  // 搜索打印机
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    fetchPrinters({
      pageNum: 1,
      pageSize,
      status: statusFilter,
      department,
      keyword: keyword.trim() || undefined,
    });
  }, [fetchPrinters, pageSize, statusFilter, department, keyword]);

  // 刷新列表
  const handleRefresh = () => {
    setKeyword('');
    setStatusFilter(onlineOnly ? 'ONLINE' : 'ALL');
    setCurrentPage(1);
    fetchPrinters({
      pageNum: 1,
      pageSize,
      status: onlineOnly ? 'ONLINE' : 'ALL',
      department,
    });
  };

  // 分页变化
  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page);
    setPageSize(size);
    fetchPrinters({
      pageNum: page,
      pageSize: size,
      status: statusFilter,
      department,
      keyword: keyword.trim() || undefined,
    });
  };

  // 选择打印机
  const handleSelectPrinter = (printer: PrinterInfo) => {
    setSelectedPrinter(printer);
  };

  // 确认选择
  const handleConfirm = () => {
    if (selectedPrinter) {
      onSelect(selectedPrinter);
      handleClose();
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setSelectedPrinter(null);
    setKeyword('');
    setStatusFilter(onlineOnly ? 'ONLINE' : 'ALL');
    setCurrentPage(1);
    onCancel();
  };

  // 表格列定义
  const columns: ColumnsType<PrinterInfo> = [
    {
      title: '打印机名称',
      dataIndex: 'printerName',
      key: 'printerName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'IP地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const isOnline = status === 'ONLINE';
        return (
          <Tag color={isOnline ? 'success' : 'error'}>
            {isOnline ? '在线' : '离线'}
          </Tag>
        );
      },
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
  ];

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleClose}
      onOk={handleConfirm}
      width={1000}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ disabled: !selectedPrinter }}
      className="printer-select-modal"
    >
      <div className="printer-select-content">
        {/* 搜索栏 */}
        <Space className="search-bar" size="middle">
          <Search
            placeholder="搜索打印机名称、IP或型号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
            style={{ width: 120 }}
          >
            <Option value="ALL">全部状态</Option>
            <Option value="ONLINE">在线</Option>
            <Option value="OFFLINE">离线</Option>
          </Select>
          <Button onClick={handleSearch} type="primary">
            搜索
          </Button>
          <Button onClick={handleRefresh} icon={<ReloadOutlined />}>
            刷新
          </Button>
        </Space>

        {/* 打印机列表 */}
        <Table
          columns={columns}
          dataSource={printers}
          loading={loading}
          rowKey="printerId"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 台打印机`,
            onChange: handlePageChange,
          }}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedPrinter ? [selectedPrinter.printerId] : [],
            onChange: (_, selectedRows) => {
              if (selectedRows.length > 0) {
                handleSelectPrinter(selectedRows[0]);
              }
            },
          }}
          onRow={(record) => ({
            onClick: () => handleSelectPrinter(record),
            className: selectedPrinter?.printerId === record.printerId ? 'selected-row' : '',
          })}
          scroll={{ y: 400 }}
        />
      </div>
    </Modal>
  );
};

export default PrinterSelectModal;
