/**
 * 条码二维码弹窗组件
 */
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, message, Space, Spin } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord, BtPrintData } from '@/types/print';
import { getBtPrintInfo, updatePrintStatus } from '@/services/print';
import { getStorage } from '@/utils/storage';
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
  const [loading, setLoading] = useState(false);
  const [printData, setPrintData] = useState<BtPrintData | null>(null);
  const barcodeRefs = useRef<(SVGSVGElement | null)[]>([]);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // 加载本体打印数据
  const loadPrintData = async () => {
    if (!record) return;
    
    setLoading(true);
    try {
      const userInfo = getStorage<{ userName: string }>('userInfo');
      const operator = userInfo?.userName || 'unknown';
      
      const response = await getBtPrintInfo({
        id: record.id,
        operator,
      });
      
      if (response.success && response.data) {
        setPrintData(response.data as unknown as BtPrintData);
      } else {
        message.error(response.errorMsg || '获取打印数据失败');
      }
    } catch (error) {
      console.error('加载打印数据失败:', error);
      // message.error('加载打印数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && record) {
      loadPrintData();
    } else {
      setPrintData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record]);

  // 生成条形码
  useEffect(() => {
    if (visible && printData && printData.fjList && printData.fjList.length > 0) {
      try {
        printData.fjList.forEach((barcodeValue, index) => {
          const ref = barcodeRefs.current[index];
          if (ref && barcodeValue) {
            JsBarcode(ref, barcodeValue, {
              format: 'CODE128',
              width: 1.5,
              height: 50,
              displayValue: true,
              fontSize: 10,
              margin: 10,
            });
          }
        });
      } catch (error) {
        console.error('生成条形码失败:', error);
        message.error('生成条形码失败');
      }
    }
  }, [visible, printData]);

  // 打印功能
  const handlePrint = async () => {
    if (!printAreaRef.current || !record || !printData) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>本体条码</title>
          <style>
            * {
              box-sizing: border-box;
              margin: 0; 
              padding: 0;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              background: #f5f5f5;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-container { 
              margin: 0 auto;
              background: white;
              border-radius: 8px;
            }
            .qr-section {
              display: flex;
              align-items: center;
              gap: 8px;
              background: #fafafa;
            }
            .qr-code-container {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .product-info {
              flex: 1;
              min-width: 0;
            }
            .info-line {
              display: flex;
              align-items: center;
              margin-bottom: 4px;
              font-size: 12px;
              flex-wrap: wrap;
            }
              .info-line1 {
                display:flex;
              }
            .info-line:last-child {
              margin-bottom: 0;
            }
            .info-label {
              font-weight: bold;
              margin-right: 4px;
              color: #333;
              flex-shrink: 0;
            }
            .info-value {
              color: #666;
              word-break: break-all;
              overflow-wrap: break-word;
              flex: 1;
              min-width: 0;
              margin-right: 1mm;
            }
            .barcode-section {
              background: transparent;
              border: none;
              padding: 0;
            }
            .barcode-item {
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
              text-align: center;
              overflow: hidden;
              background: #fafafa;
            }
           
            .barcode-item svg {
            }
            
            /* 打印样式 */
            @media print {
              * {
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              
              .print-container {
                position: static !important;
                background: white !important;
                border-radius: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: none !important;
                display: block !important;
                visibility: visible !important;
                overflow: visible !important;
              }
              
              /* 二维码区域 - 独立页面 48mm x 6mm */
              .qr-section {
                width: 48mm !important;
                height: 6mm !important;
                border: none !important;
                margin: 0 !important;
                padding: 0.5mm !important;
                background: white !important;
                border-radius: 0 !important;
                display: flex !important;
                flex-direction: row !important;
                align-items: center !important;
                gap: 0.5mm !important;
                box-sizing: border-box !important;
                page-break-inside: avoid !important;
                 overflow: hidden !important;
              }
              
              
              
              .qr-code-container {
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                flex-shrink: 0 !important;
                width: 5.5mm !important;
                height: 5.5mm !important;
              }
              
              .qr-code-container svg {
                width: 5.5mm !important;
                height: 5.5mm !important;
                display: block !important;
              }
              
              .product-info {
                display: flex !important;
                flex-direction: column !important;
                justify-content: center !important;
                flex: 1 !important;
                gap: 0.2mm !important;
              }
              
              .info-line {
                display: flex !important;
                flex-wrap: nowrap !important;
                align-items: center !important;
                margin: 0 !important;
                font-size: 4pt !important;
                line-height: 1 !important;
              }
              
              .info-label {
                font-weight: bold !important;
                color: #000 !important;
                display: flex !important;
                flex-shrink: 0 !important;
                margin-right: 0.2mm !important;
              }
              
              .info-value {
                color: #000 !important;
                display: inline !important;
                white-space: nowrap !important;
                margin-right: 0.5mm !important;
              }
              
              /* 条形码区域 - 每个条形码独立页面 48mm x 6mm */
              .barcode-section {
                display: block !important;
              }
              
              .barcode-item {
                width: 48mm !important;
                height: 6mm !important;
                border: none !important;
                margin: 0 !important;
                padding: 0.5mm !important;
                background: white !important;
                border-radius: 0 !important;
                text-align: center !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                box-sizing: border-box !important;
                page-break-after: always !important;
                page-break-inside: avoid !important;
              }
              
              .barcode-item:last-child {
                page-break-after: auto !important;
              }
              
              .barcode-item svg {
                max-height: 5mm !important;
                max-width: 46mm !important;
                width: auto !important;
                height: auto !important;
                display: block !important;
                margin: 0 auto !important;
              }
              
              /* 打印页面设置 - 48mm x 6mm */
              @page {
                margin: 0 !important;
                size: 48mm 6mm !important;
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

      // 更新打印状态
      try {
        const userInfo = getStorage<{ userName: string }>('userInfo');
        const operator = userInfo?.userName || 'unknown';
        
        await updatePrintStatus({
          id: parseInt(record.id),
          operator,
          btPrintCnt: 1,
          nbzPrintCnt: 0,
          wbzPrintCnt: 0,
        });
        
        // message.success('打印任务已发送');
      } catch (error) {
        console.error('更新打印状态失败:', error);
        // 不影响打印流程，只记录错误
      }
    }
  };

  if (!record) return null;

  // 生成二维码内容
  const qrCodeContent = printData 
    ? printData.codeSN
    : '';

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
              disabled={loading || !printData}
            >
              打印
            </Button>
            <Button onClick={onClose}>
              取消
            </Button>
          </Space>
        </div>
      }
      className="barcode-modal"
    >
      <Spin spinning={loading}>
        <div className="barcode-modal-content">
          {/* 标题信息 */}
          <div className="barcode-header">
            <div className="barcode-title">本体条码</div>
            <div className="barcode-subtitle">本体条码</div>
            <div className="barcode-size">尺寸：48mm*6mm</div>
          </div>

          {/* 二维码和产品信息区域 */}
          {printData && (
            <div ref={printAreaRef}>
              <div className="qr-section">
                <div className="qr-code-container">
                  <QRCodeSVG
                    value={printData.codeSNFull}
                    size={60}
                    level="M"
                  />
                </div>
                <div className="product-info">
                  <div className="info-line">
                    <div className='info-line1'>
                      <span className="info-label">PN:</span>
                    <span className="info-value">{printData.pnCode || ''}</span>
                    </div>
                    <div className='info-line1'>
                      <span className="info-label">Rev:</span>
                    <span className="info-value">{printData.revCode || ''}</span>
                    </div>
                  </div>
                  <div className="info-line">
                    <span className="info-label">Model:</span>
                    <span className="info-value">{printData.modelCode || ''}</span>
                  </div>
                  <div className="info-line">
                    <span className="info-label">SN:</span>
                    <span className="info-value">{printData.codeSN || ''}</span>
                  </div>
                </div>
              </div>

              {/* 条形码区域 */}
              <div className="barcode-section">
                {printData.fjList && printData.fjList.map((_, index) => (
                  <div key={index} className="barcode-item">
                    <svg ref={(el) => { barcodeRefs.current[index] = el; }}></svg>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default BarcodeModal;