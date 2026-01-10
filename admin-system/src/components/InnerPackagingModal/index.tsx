/**
 * 内包装条码弹窗组件
 */
import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Space, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import { scanBtcode, updatePrintStatus } from '@/services/print';
import { getStorage } from '@/utils/storage';
import './index.css';

interface InnerPackagingModalProps {
  visible: boolean;
  onClose: () => void;
  record: BarcodeRecord | null;
}

interface PrintData {
  partNo: string;
  qty: number;
  description: string;
  dc: string;
  supplierCode: string;
  sn: string;
  qrCodeData: string;
}

const InnerPackagingModal: React.FC<InnerPackagingModalProps> = ({
  visible,
  onClose,
  record
}) => {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const supplierBarcodeRef = useRef<SVGSVGElement>(null);
  const printContentRef = useRef<HTMLDivElement>(null);
  
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordId, setRecordId] = useState<string>('');

  // 加载打印数据
  const loadPrintData = async () => {
    if (!record?.codeSn) return;
    
    setLoading(true);
    try {
      // 调用扫本体码接口获取内包装码打印信息
      const detail = await scanBtcode(record.codeSn);
      
      if (detail) {
        // 保存记录ID用于更新打印状态
        setRecordId(detail.id);
        
        // 格式化日期
        const dcDate = detail.dcDate 
          ? new Date(parseInt(detail.dcDate)).toISOString().split('T')[0]
          : '';
        
        const mappedData: PrintData = {
          partNo: detail.partNo || '',
          qty: detail.qty ? parseInt(detail.qty) : 1,
          description: detail.remark || '',
          dc: dcDate,
          supplierCode: detail.supplierCode || '',
          sn: detail.codeSN || '',
          qrCodeData: detail.codeSN
        };
        
        setPrintData(mappedData);
      }
    } catch (error) {
      console.error('加载打印数据失败:', error);
      // message.error('加载打印数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (visible && record) {
      loadPrintData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, record]);

  // 生成条形码
  React.useEffect(() => {
    if (!printData) return;
    
    if (visible && barcodeRef.current) {
      JsBarcode(barcodeRef.current, printData.partNo || '0240A00ATC', {
        format: 'CODE128',
        width: 1.3,
        height: 35,
        displayValue: false,
        margin: 0,
      });
    }
    
    if (visible && supplierBarcodeRef.current) {
      JsBarcode(supplierBarcodeRef.current, printData.supplierCode || 'HZ', {
        format: 'CODE128',
        width: 1.3,
        height: 28,
        displayValue: false,
        margin: 0,
      });
    }
  }, [visible, printData]);

  if (!record || !printData) return null;

  // 处理打印操作
  const handlePrint = async () => {
    if (!printContentRef.current || !printData) return;
    
    try {
      // 等待Canvas渲染完成
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>内包装条码</title>
          <meta charset="utf-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            /* 打印专用样式 */
           
            
            html,body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0;
              width: 100%;
              height: 100%;
              background: white;
            }
            
            .print-container { 
              display: flex;
              width: 100%;
              height: 100%;
              padding: 1mm !important;
              background: white;
              overflow: hidden;
              box-sizing: border-box;
            }
            
            .barcode-container {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: space-between;
              box-sizing: border-box;
            }

            .barcode-info {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              flex:1;
            }

            .part-info {
              margin-bottom: 0.5mm;
              font-size: 8pt;
              font-weight: bold;
              line-height: 1.2;
              color: #000;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .part-label {
              color: #000;
            }

            .part-value {
              color: #000;
            }

            .barcode-image {
              margin-top: 0.5mm;
              margin-bottom: 0.5mm;
              display: flex;
              justify-content: flex-start;
              overflow: hidden;
            }


            .info-row {
              margin-bottom: 0.5mm;
              font-size: 7pt;
              line-height: 1.2;
            }

         
          

            .info-item .label {
              font-weight: bold;
              color: #000;
            }

            .info-item .value {
              color: #000;
              display: inline;
              word-wrap: break-word;
              word-break: break-all;
              overflow-wrap: break-word;
            }
            .right-info1 {
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: flex-end;
              width:auto;
            }
           
            .right-info {
              display: flex;
              flex-direction: column;
            }

            .right-info .info-item {
              font-size: 7pt;
              margin-bottom: 0.5mm;
              line-height: 1.2;
              display: flex;
            }

            .right-info .info-item .label {
              font-weight: bold;
              color: #000;
            }

            .right-info .info-item .value {
              color: #000;
            }

            .supplier-barcode {
              display: flex;
              overflow: hidden;
              margin-top: 1.5mm !important;
              padding-left:1.5mm!important;
              margin-bottom:1.5mm!important;
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
            
            @media print {
           
              .part-info {
                font-size: 8pt !important;
                font-weight: bold !important;
                line-height: 1.2 !important;
                color: #000 !important;
              }
              
              .barcode-image {
                margin-top: 1.5mm !important;
                padding-left:1.5mm!important;
                margin-bottom:1.5mm!important;
                display: flex !important;
              }
              
              .info-row {
                font-size: 7pt !important;
                line-height: 1.2 !important;
                margin-bottom: 0.5mm !important;
              }
              
             
              
              
              .info-item .label {
                font-weight: bold !important;
                color: #000 !important;
              }
              
              .info-item .value {
                color: #000 !important;
                word-wrap: break-word !important;
                word-break: break-all !important;
                overflow-wrap: break-word !important;
              }
              
             
             
               @page {
                margin: 0;
                size: 100mm 70mm;
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
      setTimeout(async () => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        
        // 更新打印状态
        if (recordId) {
          try {
            const userInfo = getStorage<{ id: string; username: string }>('userInfo');
            await updatePrintStatus({
              id: parseInt(recordId),
              operator: userInfo?.username || 'unknown',
              nbzPrintCnt: 1,
              wbzPrintCnt: 0,
              btPrintCnt: 0,
            });
            // message.success('打印任务已发送');
          } catch (error) {
            console.error('更新打印状态失败:', error);
          }
        }
      }, 500);
    }
    } catch (error) {
      console.error('打印失败:', error);
      message.error('打印失败，请重试');
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
            尺寸：100mm*70mm
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : (
          <div className="barcode-container" ref={printContentRef}>
            <div className="barcode-info">
              <div className='barcode-info1'>
                  <div className="part-info">
                  <span className="part-label">PartNO: </span>
                  <span className="part-value">{printData.partNo}</span>
                </div>

                <div className="barcode-image">
                  <svg ref={barcodeRef}></svg>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <span className="label">QTY: </span>
                    <span className="value">{printData.qty}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item">
                    <span className="label">描述: </span>
                    <span className="value">{printData.description}</span>
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-item full-width">
                    <span className="label">SN: </span>
                    <span className="value">{printData.sn}</span>
                  </div>
                </div>
              </div>

              <div className="qr-code-section">
                <QRCodeSVG
                  value={printData.qrCodeData}
                  size={80}
                  level="M"
                />
              </div>
            </div>

            <div className="right-info1">
              <div className="right-info">
                <div className="info-item">
                  <span className="label">D/C: </span>
                  <span className="value">{printData.dc}</span>
                </div>

                <div className="info-item">
                  <span className="label">供应商代码: </span>
                  <span className="value">{printData.supplierCode}</span>
                </div>

                <div className="supplier-barcode">
                  <svg ref={supplierBarcodeRef}></svg>
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </Modal>
  );
};

export default InnerPackagingModal;