/**
 * 内包装条码弹窗组件
 */
import React from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import type { BarcodeRecord } from '@/types/print';
import './index.css';

interface InnerPackagingModalProps {
  visible: boolean;
  onClose: () => void;
  record: BarcodeRecord | null;
}

const InnerPackagingModal: React.FC<InnerPackagingModalProps> = ({
  visible,
  onClose,
  record
}) => {
  if (!record) return null;

  // 处理打印操作
  const handlePrint = () => {
    console.log('打印内包装条码:', record);
    // 这里可以调用打印API
    onClose();
  };

  return (
    <Modal
      title="内包装条码"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      className="inner-packaging-modal"
    >
      <div className="inner-packaging-content">
        <div className="header-info">
          <div className="title">内包装条码</div>
          <div className="subtitle">
            内包装条码<br />
            尺寸：70mm*50mm
          </div>
        </div>

        <div className="barcode-container">
          <div className="barcode-info">
            <div className="part-info">
              <span className="part-label">PartNO: </span>
              <span className="part-value">{record.projectCode || '0240A00ATC'}</span>
            </div>

            <div className="barcode-image">
              {/* 这里应该是实际的条码图片，暂时用占位符 */}
              <div className="barcode-placeholder">
                <div className="barcode-lines">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="barcode-line" />
                  ))}
                </div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <span className="label">QTY: </span>
                <span className="value">1</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <span className="label">描述: </span>
                <span className="value">{record.remark || 'APDB16'}</span>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item full-width">
                <span className="label">SN: </span>
                <span className="value">{record.snCode || 'S0000012A001IP9302A01RG52PA01'}</span>
              </div>
            </div>

            <div className="qr-code-section">
              <div className="qr-code-placeholder">
                {/* QR码占位符 */}
                <div className="qr-grid">
                  {Array.from({ length: 100 }, (_, i) => (
                    <div key={i} className={`qr-dot ${Math.random() > 0.5 ? 'filled' : ''}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="right-info">
            <div className="info-item">
              <span className="label">D/C: </span>
              <span className="value">{record.deliveryDate || '2025-07-14'}</span>
            </div>

            <div className="info-item">
              <span className="label">供应商代码: </span>
              <span className="value">HZ</span>
            </div>

            <div className="supplier-barcode">
              {/* 供应商条码 */}
              <div className="supplier-barcode-lines">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="supplier-barcode-line" />
                ))}
              </div>
            </div>
          </div>
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

export default InnerPackagingModal;