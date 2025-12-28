/**
 * 条码二维码弹窗组件
 */
import React, { useEffect, useRef } from 'react';
import { Modal, Button, message } from 'antd';
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
    const printWindow = window.open('', '_blank');
    if (printWindow && record) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>本体条码</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background: white;
            }
            .print-container { 
              max-width: 800px; 
              margin: 0 auto; 
            }
            .header { 
              text-align: left; 
              margin-bottom: 20px; 
              font-size: 18px;
              font-weight: bold;
            }
            .info-section { 
              margin-bottom: 20px; 
              padding: 10px;
              border: 1px solid #ddd;
            }
            .info-row { 
              margin: 5px 0; 
              font-size: 14px;
            }
            .code-section { 
              margin: 20px 0; 
              padding: 15px;
              border: 1px solid #ddd;
              text-align: center;
            }
            .qr-code { 
              margin: 10px 0; 
            }
            .barcode { 
              margin: 15px 0; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="header">本体条码</div>
            <div class="info-section">
              <div class="info-row">本体条码</div>
              <div class="info-row">尺寸：42mm*10mm</div>
            </div>
            <div class="code-section">
              <div class="qr-code">
                ${document.querySelector('.qr-code-container')?.innerHTML || ''}
              </div>
              <div class="info-row">PN: ${record.projectCode} &nbsp;&nbsp; Rev: ${record.techVersion}</div>
              <div class="info-row">Model: ${record.factoryCode}</div>
              <div class="info-row">SN: ${record.snCode}</div>
            </div>
            <div class="barcode">
              ${barcodeRef1.current?.outerHTML || ''}
            </div>
            <div class="barcode">
              ${barcodeRef2.current?.outerHTML || ''}
            </div>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
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
          <Button type="primary" className="print-button" onClick={handlePrint}>
            打印
          </Button>
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
        <div className="qr-section">
          <div className="qr-content">
            <div className="qr-code-container">
              <QRCodeSVG
                value={qrCodeContent}
                size={100}
                level="M"
                includeMargin={false}
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
    </Modal>
  );
};

export default BarcodeModal;