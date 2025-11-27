/**
 * 订单管理页面
 */
import { Button, Space, Tag, Drawer, message, Modal, Descriptions } from 'antd';
import { DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { BasicTable, SearchForm } from '@/components';
import { useTable } from '@/hooks';
import { getOrderList, getOrderDetail, exportOrders } from '@/services/order';
import type { Order } from '@/types';

export default function OrderManage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<Order[]>([]);

  // 使用表格Hook
  const { loading, dataSource, pagination, loadData, refresh } = useTable({
    onLoad: async (params) => {
      const result = await getOrderList(params);
      return result;
    },
  });

  // 搜索字段配置
  const searchFields = [
    { name: 'orderNo', label: '订单号', type: 'input' as const, placeholder: '请输入订单号' },
    { name: 'customerName', label: '客户名称', type: 'input' as const, placeholder: '请输入客户名称' },
    {
      name: 'status',
      label: '订单状态',
      type: 'select' as const,
      options: [
        { label: '全部', value: '' },
        { label: '待确认', value: 'pending' },
        { label: '已确认', value: 'confirmed' },
        { label: '已发货', value: 'shipped' },
        { label: '已完成', value: 'completed' },
        { label: '已取消', value: 'cancelled' },
      ],
    },
  ];

  // 状态标签颜色映射
  const statusColorMap: Record<string, string> = {
    pending: 'default',
    confirmed: 'processing',
    shipped: 'warning',
    completed: 'success',
    cancelled: 'error',
  };

  // 状态文本映射
  const statusTextMap: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  };

  // 表格列配置
  const columns = [
    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `¥${amount.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>{statusTextMap[status] || status}</Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space>
          <Button type="link" onClick={() => handleViewDetail(record.id)}>
            查看
          </Button>
          <Button type="link">打印</Button>
        </Space>
      ),
    },
  ];

  // 查看详情
  const handleViewDetail = async (id: string) => {
    const detail = await getOrderDetail(id);
    setCurrentOrder(detail);
    setDrawerOpen(true);
  };

  // 导出订单
  const handleExport = async () => {
    try {
      if (selectedRowKeys.length > 0) {
        // 导出选中的订单
        await exportOrders({ ids: selectedRowKeys as string[] });
        message.success(`成功导出 ${selectedRowKeys.length} 条订单`);
      } else {
        // 导出全部订单
        await exportOrders();
        message.success('订单导出成功');
      }
    } catch (error) {
      message.error('订单导出失败');
    }
  };

  // 批量操作
  const handleBatchOperation = (operation: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择订单');
      return;
    }

    Modal.confirm({
      title: '确认操作',
      icon: <ExclamationCircleOutlined />,
      content: `确定要对选中的 ${selectedRowKeys.length} 条订单执行${operation}操作吗？`,
      onOk: async () => {
        try {
          // 这里可以调用批量操作的API
          message.success(`批量${operation}成功`);
          setSelectedRowKeys([]);
          setSelectedRows([]);
          refresh();
        } catch (error) {
          message.error(`批量${operation}失败`);
        }
      },
    });
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[], rows: Order[]) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  return (
    <div>
      <SearchForm fields={searchFields} onSearch={loadData} />

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出订单 {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
          </Button>
          {selectedRowKeys.length > 0 && (
            <>
              <Button onClick={() => handleBatchOperation('确认')}>批量确认</Button>
              <Button onClick={() => handleBatchOperation('发货')}>批量发货</Button>
              <Button danger onClick={() => handleBatchOperation('取消')}>
                批量取消
              </Button>
            </>
          )}
        </Space>
      </div>

      <BasicTable
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        rowSelection={rowSelection}
        rowKey="id"
        onRefresh={refresh}
      />

      <Drawer
        title="订单详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
      >
        {currentOrder && (
          <div>
            <Descriptions title="基本信息" bordered column={2}>
              <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
              <Descriptions.Item label="客户ID">{currentOrder.customerId}</Descriptions.Item>
              <Descriptions.Item label="客户名称">{currentOrder.customerName}</Descriptions.Item>
              <Descriptions.Item label="订单金额">
                ¥{currentOrder.amount.toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                <Tag color={statusColorMap[currentOrder.status]}>
                  {statusTextMap[currentOrder.status]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentOrder.createTime}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{currentOrder.updateTime}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>
                {currentOrder.remark || '无'}
              </Descriptions.Item>
            </Descriptions>

            {currentOrder.items && currentOrder.items.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3>订单明细</h3>
                <BasicTable
                  dataSource={currentOrder.items}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '产品ID', dataIndex: 'productId', key: 'productId' },
                    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
                    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
                    {
                      title: '单价',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price: number) => `¥${price.toFixed(2)}`,
                    },
                    {
                      title: '小计',
                      dataIndex: 'amount',
                      key: 'amount',
                      render: (amount: number) => `¥${amount.toFixed(2)}`,
                    },
                  ]}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
