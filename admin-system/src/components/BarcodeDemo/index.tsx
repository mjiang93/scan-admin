/**
 * 条码演示组件 - 用于测试条码功能
 */
import React, { useState } from 'react';
import { Button, Card, Space } from 'antd';
import BarcodeModal from '@/components/BarcodeModal';
import type { BarcodeRecord } from '@/types/print';

const BarcodeDemo: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

  // 模拟数据
  const mockRecord: BarcodeRecord = {
    key: 'demo-1',
    id: 'demo-1',
    supplierCode: 'SUP001',
    projectCode: '9302A01RG5',
    factoryCode: '00000124A001',
    productionLine: 'Line1',
    techVersion: 'A01',
    snCode: '00000124A001',
    code09: '9302A01RG52PA01',
    deliveryDate: '2024-01-15',
    templateSnCode: '00000124A001',
    circuitBoardCode: 'PCB001',
    accessories: '2件',
    printStatus: 'unprintedStatus' as const,
    printCount: 0,
    createTime: '2024-01-15 10:30:00',
    remark: '演示数据',
  };

  return (
    <Card title="条码功能演示" style={{ margin: 20 }}>
      <Space direction="vertical" size="middle">
        <div>
          <h4>演示数据：</h4>
          <p><strong>项目编码：</strong>{mockRecord.projectCode}</p>
          <p><strong>出厂码：</strong>{mockRecord.factoryCode}</p>
          <p><strong>技术版本：</strong>{mockRecord.techVersion}</p>
          <p><strong>SN码：</strong>{mockRecord.snCode}</p>
        </div>
        
        <Button 
          type="primary" 
          onClick={() => setModalVisible(true)}
        >
          显示条码弹窗
        </Button>
      </Space>

      <BarcodeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        record={mockRecord}
      />
    </Card>
  );
};

export default BarcodeDemo;