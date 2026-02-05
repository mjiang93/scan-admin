/**
 * 打印机选择组件使用示例
 */
import React from 'react';
import { Button, Space, Card, Descriptions, Tag, message } from 'antd';
import { PrinterOutlined, DeleteOutlined } from '@ant-design/icons';
import { PrinterSelectModal } from '@/components';
import { usePrinterSelect } from '@/hooks';

/**
 * 打印机选择示例页面
 */
export default function PrinterSelectExample() {
  const { 
    visible, 
    selectedPrinter, 
    openModal, 
    closeModal, 
    handleSelect,
    clearSelection 
  } = usePrinterSelect();

  // 模拟打印操作
  const handlePrint = () => {
    if (!selectedPrinter) {
      message.warning('请先选择打印机');
      return;
    }

    if (selectedPrinter.status !== 'ONLINE') {
      message.error('打印机离线，无法打印');
      return;
    }

    message.success(`正在使用 ${selectedPrinter.printerName} 打印...`);
    
    // 这里调用实际的打印接口
    // await printService.print({
    //   printerId: selectedPrinter.printerId,
    //   ip: selectedPrinter.ip,
    //   port: selectedPrinter.port,
    //   ...printData
    // });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="打印机选择示例">
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              onClick={openModal}
            >
              选择打印机
            </Button>
            
            {selectedPrinter && (
              <Button 
                icon={<DeleteOutlined />} 
                onClick={clearSelection}
              >
                清除选择
              </Button>
            )}
          </Space>

          {selectedPrinter ? (
            <Card 
              size="small" 
              style={{ marginTop: 16 }}
              title="当前选择的打印机"
            >
              <Descriptions column={2} bordered>
                <Descriptions.Item label="打印机名称">
                  {selectedPrinter.printerName}
                </Descriptions.Item>
                <Descriptions.Item label="打印机ID">
                  {selectedPrinter.printerId}
                </Descriptions.Item>
                <Descriptions.Item label="型号">
                  {selectedPrinter.model}
                </Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={selectedPrinter.status === 'ONLINE' ? 'success' : 'error'}>
                    {selectedPrinter.status === 'ONLINE' ? '在线' : '离线'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="IP地址">
                  {selectedPrinter.ip}
                </Descriptions.Item>
                <Descriptions.Item label="端口">
                  {selectedPrinter.port}
                </Descriptions.Item>
                {selectedPrinter.department && (
                  <Descriptions.Item label="部门">
                    {selectedPrinter.department}
                  </Descriptions.Item>
                )}
                {selectedPrinter.location && (
                  <Descriptions.Item label="位置">
                    {selectedPrinter.location}
                  </Descriptions.Item>
                )}
                {selectedPrinter.remark && (
                  <Descriptions.Item label="备注" span={2}>
                    {selectedPrinter.remark}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div style={{ marginTop: 16 }}>
                <Button 
                  type="primary" 
                  size="large"
                  onClick={handlePrint}
                  disabled={selectedPrinter.status !== 'ONLINE'}
                >
                  开始打印
                </Button>
              </div>
            </Card>
          ) : (
            <Card size="small" style={{ marginTop: 16 }}>
              <p style={{ color: '#999', textAlign: 'center' }}>
                暂未选择打印机，请点击上方按钮选择
              </p>
            </Card>
          )}
        </Card>

        {/* 使用说明 */}
        <Card title="使用说明">
          <ol>
            <li>点击"选择打印机"按钮打开打印机选择弹窗</li>
            <li>在弹窗中可以搜索、筛选打印机</li>
            <li>点击表格行或使用单选框选择打印机</li>
            <li>点击"确定"按钮完成选择</li>
            <li>选择后可以查看打印机详细信息</li>
            <li>点击"开始打印"执行打印操作（需要打印机在线）</li>
            <li>点击"清除选择"可以重新选择打印机</li>
          </ol>
        </Card>
      </Space>

      {/* 打印机选择弹窗 */}
      <PrinterSelectModal
        visible={visible}
        onCancel={closeModal}
        onSelect={handleSelect}
        title="选择打印机"
      />
    </div>
  );
}
