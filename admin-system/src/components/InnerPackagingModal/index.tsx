/**
 * 内包装条码弹窗组件
 */
import React, { useRef } from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
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
  const barcodeRef = useRef<SVGSVGElement>(null);
  const supplierBarcodeRef = useRef<SVGSVGElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);

  // 生成条形码
  React.useEffect(() => {
    if (!record) return;
    
    if (visible && barcodeRef.current) {
      JsBarcode(barcodeRef.current, record.projectCode || '0240A00ATC', {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: false,
        margin: 0,
      });
    }
    
    if (visible && supplierBarcodeRef.current) {
      JsBarcode(supplierBarcodeRef.current, 'HZ', {
        format: 'CODE128',
        width: 3,
        height: 40,
        displayValue: false,
        margin: 0,
      });
    }
  }, [visible, record]);

  if (!record) return null;

  // 处理打印操作
  const handlePrint = () => {
    if (!printContentRef.current || !record) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // 获取当前页面的所有样式表
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            console.warn('无法访问样式表:', e);
            return '';
          }
        })
        .join('\n');

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>内包装条码</title>
          <meta charset="utf-8">
          <style>
            ${styles}
            
            /* 打印专用样式覆盖 */
            @page {
              margin: 5mm;
              size: A4;
            }
            
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 10px;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .print-container { 
              max-width: 800px; 
              margin: 0 auto;
              background: white;
            }
            
            @media print {
              body { 
                margin: 0; 
                padding: 5px; 
              }
              
              .print-container {
                background: white !important;
                box-shadow: none !important;
                display: flex;
                align-items: center;
                border: 1px solid #ddd;
                padding: 20px;
                background: #fff;
                display: flex;
                gap: 30px;
                min-height: 350px;
                position: relative;
                align-items: center;
              }
              
              .barcode-container {
  
}

.barcode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.part-info {
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: bold;
}

.part-label {
  color: #333;
}

.part-value {
  color: #333;
}

.barcode-image {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-start;
}

.barcode-image svg {
  /* border: 1px solid #eee; */
}

.info-row {
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item {
  display: inline-block;
}

.info-item.full-width {
  display: block;
  width: 100%;
}

.info-item .label {
  font-weight: bold;
  color: #333;
}

.info-item .value {
  color: #333;
}

.qr-code-section {
  margin-top: auto;
  display: flex;
  justify-content: flex-start;
  padding-top: 10px;
}

.right-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 150px;
  align-items: flex-end;
  text-align: right;
}

.right-info .info-item {
  font-size: 14px;
  margin-bottom: 10px;
}

.right-info .info-item .label {
  font-weight: bold;
}

.supplier-barcode {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}

.supplier-barcode svg {
  /* border: 1px solid #eee; */
}
              
              /* 确保条码和二维码正确显示 */
              svg {
                display: block !important;
              }
              
              /* 确保文字颜色在打印时显示为黑色 */
              .part-label, .part-value, .label, .value {
                color: #000 !important;
              }
              
              /* 隐藏不需要打印的元素 */
              .modal-footer,
              .header-info {
                display: none !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContentRef.current.innerHTML}
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

  return (
    <Modal
      title="内包装条码"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
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

        <div className="barcode-container" ref={printContentRef}>
          <div className="barcode-info">
            <div className="part-info">
              <span className="part-label">PartNO: </span>
              <span className="part-value">{record.projectCode || '0240A00ATC'}</span>
            </div>

            <div className="barcode-image">
              <svg ref={barcodeRef}></svg>
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
              <QRCodeSVG
                value={record.snCode || 'S0000012A001IP9302A01RG52PA01'}
                size={80}
                level="M"
              />
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
              <svg ref={supplierBarcodeRef}></svg>
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