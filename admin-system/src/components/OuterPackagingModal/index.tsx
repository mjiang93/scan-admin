/**
 * 外包装弹窗组件 - 供应商送货标签
 */
import React from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import './index.css';

interface OuterPackagingModalProps {
  visible: boolean;
  onClose: () => void;
  record: BarcodeRecord | null;
}

const OuterPackagingModal: React.FC<OuterPackagingModalProps> = ({
  visible,
  onClose,
  record
}) => {
  if (!record) return null;

  // 处理打印操作
  const handlePrint = () => {
    console.log('打印外包装标签:', record);
    // 这里可以调用打印API
    onClose();
  };

  // 生成二维码数据
  const generateQRData = () => {
    return JSON.stringify({
      materialCode: record.circuitBoardCode || '0228A00179',
      name: record.remark || '系统电源-3相交流380V-无',
      quantity: 100,
      supplierCode: 'Bxxxxxx',
      poNumber: 'PO620120240819000316',
      batchNumber: 'XXXXXXXXXXXXXXX',
      deliveryDate: record.deliveryDate || '2024-09-01',
      snCode: record.snCode || 'S0000012A001IP9302A01RG52PA01'
    });
  };

  return (
    <Modal
      title="外包装标签"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="outer-packaging-modal"
    >
      <div className="outer-packaging-content">
        <div className="header-info">
          <div className="title">供应商送货标签</div>
          <div className="subtitle">
            外包装条码<br />
            尺寸：70mm*50mm
          </div>
        </div>

        <div className="delivery-label-container">
          <div className="label-header">
            <h3>供应商送货标签</h3>
          </div>

          <table className="delivery-table">
            <tbody>
              <tr>
                <td className="label-cell">物料编码</td>
                <td className="value-cell">{record.circuitBoardCode || '0228A00179'}</td>
                <td className="qr-section" rowSpan={4}>
                  <div className="qr-code-container">
                    <div className="qr-code">
                      <QRCodeSVG
                        value={generateQRData()}
                        size={90}
                        level="M"
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="label-cell">名称型号</td>
                <td className="value-cell multi-line">{record.remark || '系统电源-3相交流380V-无'}</td>
              </tr>
              <tr>
                <td className="label-cell">数量</td>
                <td className="value-cell">100</td>
              </tr>
              <tr>
                <td className="label-cell">供应商代码</td>
                <td className="value-cell">Bxxxxxx</td>
              </tr>
              <tr>
                <td className="label-cell">PO/行号</td>
                <td className="value-cell">PO620120240819000316</td>
                <td className="right-label-cell">单位</td>
                <td className="right-value-cell">PCS</td>
              </tr>
              <tr>
                <td className="label-cell">批号</td>
                <td className="batch-value highlighted">XXXXXXXXXXXXXXX</td>
                <td className="right-label-cell">送货日期</td>
                <td className="right-value-cell">{record.deliveryDate || '2024-09-01'}</td>
              </tr>
              <tr>
                <td className="label-cell">存储/清洁</td>
                <td className="value-cell">S50</td>
                <td className="right-label-cell">送货单号</td>
                <td className="right-value-cell">(预留)</td>
              </tr>
            </tbody>
          </table>

        </div>

        <div className="modal-footer">
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              打印
            </Button>
            <Button onClick={onClose}>
              取消
            </Button>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default OuterPackagingModal;