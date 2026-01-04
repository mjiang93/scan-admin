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
    
    // 获取打印内容（只获取标签容器）
    const printContent = document.querySelector('.delivery-label-container');
    if (!printContent) {
      console.error('未找到打印内容');
      return;
    }

    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('无法打开打印窗口');
      return;
    }

    // 构建打印页面HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>供应商送货标签</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: auto;
              margin: 0;
            }
            
            html, body {
              margin: 0;
              padding: 0;
            }
            
            body {
              padding: 10mm;
            }
            
            .delivery-label-container {
              border: 2px solid #333;
              padding: 16px;
              background: #fff;
              position: relative;
            }
            
            .label-header {
              text-align: center;
              margin-bottom: 16px;
              border-bottom: 1px solid #333;
              padding-bottom: 8px;
            }
            
            .label-header h3 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
            }
            
            .delivery-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            }
            
            .delivery-table td {
              border: 1px solid #333;
              padding: 8px 12px;
              vertical-align: middle;
              height: 40px;
            }
            
            .label-cell {
              background-color: #f5f5f5;
              font-weight: bold;
              width: 100px;
              text-align: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .value-cell {
              text-align: center;
            }
            
            .value-cell.multi-line {
              line-height: 1.3;
              padding: 6px 12px;
            }
            
            .qr-section {
              text-align: center;
              vertical-align: middle;
              position: relative;
              padding: 16px;
            }
            
            .qr-code-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 8px;
              height: 100%;
              justify-content: center;
            }
            
            .qr-code {
              width: 100px;
              height: 100px;
              border: 1px solid #333;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              padding: 5px;
            }
            
            .qr-code svg {
              width: 90px;
              height: 90px;
            }
            
            @media print {
              body {
                padding: 20px;
              }
              
              .delivery-label-container {
                page-break-after: avoid;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // 等待内容加载完成后打印
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
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
                <td className="value-cell" colSpan={2}>{record.circuitBoardCode || '0228A00179'}</td>
                <td className="qr-section" rowSpan={2}>
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
                <td className="value-cell multi-line" colSpan={2}>{record.remark || '系统电源-3相交流380V-无'}</td>
              </tr>
              <tr>
                <td className="label-cell">数量</td>
                <td className="value-cell">100</td>
                <td className="label-cell">单位</td>
                <td className="value-cell">PCS</td>
              </tr>
              <tr>
                <td className="label-cell">供应商代码</td>
                <td className="value-cell">Bxxxxxx</td>
                <td className="label-cell">送货日期</td>
                <td className="value-cell">{record.deliveryDate || '2024-09-01'}</td>
              </tr>
              <tr>
                <td className="label-cell">PO/行号</td>
                <td className="value-cell" >PO620120240819000316</td>
                <td className="label-cell">送货单号</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td className="label-cell">批号</td>
                <td className="value-cell" colSpan={3}>XXXXXXXXXXXXXXX</td>
              </tr>
              <tr>
                <td className="label-cell">存储/清洁</td>
                <td className="value-cell" colSpan={3}>S50</td>
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