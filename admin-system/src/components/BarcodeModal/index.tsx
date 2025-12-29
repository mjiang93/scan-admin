/**
 * 条码二维码弹窗组件
 */
import React, { useEffect, useRef } from 'react';
import { Modal, Button, message, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import './index.css';

interface BarcodeModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 条码记录数据 */
  record: BarcodeRecord | null;
}

export const BarcodeModal: React.FC<BarcodeModalProps> = ({
  visible,
  onClose,
  record,
}) => {
  const barcodeRef1 = useRef<SVGSVGElement>(null);
  const barcodeRef2 = useRef<SVGSVGElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // 生成条形码
  useEffect(() => {
    if (visible && record && barcodeRef1.current && barcodeRef2.current) {
      try {
        // 第一个条形码 - 使用SN码
        const barcode1Text = `S${record.snCode}IP${record.projectCode}PA${record.code09}-001`;
        JsBarcode(barcodeRef1.current, barcode1Text, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });

        // 第二个条形码 - 使用SN码变体
        const barcode2Text = `S${record.snCode}IP${record.projectCode}PA${record.code09}-002`;
        JsBarcode(barcodeRef2.current, barcode2Text, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('生成条形码失败:', error);
        message.error('生成条形码失败');
      }
    }
  }, [visible, record]);

  // 打印功能
  const handlePrint = () => {
    if (!printAreaRef.current || !record) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>本体条码</title>
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container { 
              max-width: 800px; 
              margin: 0 auto;
              border-radius: 4px;
              padding: 20px;
              background: white;
            }
            .qr-section {
              background: white;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              padding: 20px;
              margin-bottom: 16px;
            }
            .qr-content {
              display: flex;
              align-items: center;
              gap: 40px;
            }
            .qr-code-container {
              flex-shrink: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: white;
              padding: 8px;
            }
            .product-info {
              flex: 1;
            }
            .info-line {
              margin: 12px 0;
              font-size: 14px;
              line-height: 1.6;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-label {
              font-weight: 500;
              color: #666;
              min-width: 50px;
              text-align: left;
            }
            .info-value {
              color: #333;
              font-weight: 400;
              margin-right: 12px;
            }
            .barcode-section {
              background: transparent;
              border: none;
              padding: 0;
            }
            .barcode-item {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 16px 0;
              padding: 16px;
              background: white;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
            }
            .barcode-item svg {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10px; 
              }
              .print-container {
                background: white !important;
                box-shadow: none !important;
              }
              .qr-section {
                border: 1px solid #333 !important;
                background: white !important;
                box-shadow: none !important;
              }
              .barcode-item {
                border: 1px solid #333 !important;
                background: white !important;
                margin: 10px 0 !important;
              }
              .info-label,
              .info-value {
                color: #000 !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printAreaRef.current.innerHTML}
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // 等待内容加载完成后再打印
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  if (!record) return null;

  // 生成二维码内容
  const qrCodeContent = `PN:${record.projectCode};Rev:${record.techVersion};Model:${record.factoryCode};SN:${record.snCode}`;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <div className="modal-footer">
          
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
            >
              打印
            </Button>
            {/* <Button type="primary" className="print-button" onClick={handlePrint}>
              打印
            </Button> */}
            <Button onClick={onClose}>
              取消
            </Button>
          </Space>
        </div>
      }
      className="barcode-modal"
    >
      <div className="barcode-modal-content">
        {/* 标题信息 */}
        <div className="barcode-header">
          <div className="barcode-title">本体条码</div>
          <div className="barcode-subtitle">本体条码</div>
          <div className="barcode-size">尺寸：42mm*10mm</div>
        </div>

        {/* 二维码和产品信息区域 */}
        <div ref={printAreaRef}>
          <div className="qr-section">
            <div className="qr-content">
              <div className="qr-code-container">
                <QRCodeSVG
                  value={qrCodeContent}
                  size={100}
                  level="M"
                />
              </div>
              <div className="product-info">
                <div className="info-line">
                  <span className="info-label">PN:</span>
                  <span className="info-value">{record.projectCode}</span>
                  <span className="info-label">Rev:</span>
                  <span className="info-value">{record.techVersion}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">Model:</span>
                  <span className="info-value">{record.factoryCode}</span>
                </div>
                <div className="info-line">
                  <span className="info-label">SN:</span>
                  <span className="info-value">{record.snCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 条形码区域 */}
          <div className="barcode-section">
            <div className="barcode-item">
              <svg ref={barcodeRef1}></svg>
            </div>
            <div className="barcode-item">
              <svg ref={barcodeRef2}></svg>
            </div>
          </div>
        </div>

        
      </div>
    </Modal>
  );
};

export default BarcodeModal;