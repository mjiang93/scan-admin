/**
 * 外包装弹窗组件 - 供应商送货标签
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, message } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import { scanNbzcode, updatePrintStatus } from '@/services/print';
import { getStorage } from '@/utils/storage';
import { formatDate } from '@/utils/format';
import './index.css';

interface OuterPackagingModalProps {
  visible: boolean;
  onClose: () => void;
  record: BarcodeRecord | null;
}

interface OuterPackagingData {
  id: number;
  materialCode: string;
  nameModel: string;
  supplierCode: string;
  unit: string;
  cnt: number;
  code09: string;
  codeSN: string;
  deliveryDate: string;
  deliveryNo: string;
  poNo: string;
  saveClean: string;
}

const OuterPackagingModal: React.FC<OuterPackagingModalProps> = ({
  visible,
  onClose,
  record
}) => {
  const [loading, setLoading] = useState(false);
  const [outerPackagingData, setOuterPackagingData] = useState<OuterPackagingData | null>(null);

  // 加载外包装数据
  const loadData = async (code: string) => {
    setLoading(true);
    try {
      const data = await scanNbzcode(code);
      console.log('外包装数据:', data);
      console.log('送货日期:', data.deliveryDate);
      setOuterPackagingData(data);
    } catch (error) {
      console.error('获取外包装信息失败:', error);
      message.error('获取外包装信息失败');
    } finally {
      setLoading(false);
    }
  };

  // 当弹窗打开时自动调用接口获取数据
  useEffect(() => {
    if (visible && record?.codeSn) {
      loadData(record.codeSn);
    } else if (!visible) {
      setOuterPackagingData(null);
    }
  }, [visible, record]);

  if (!record) return null;

  // 处理打印操作
  const handlePrint = async () => {
    console.log('打印外包装标签:', outerPackagingData || record);
    
    // 获取打印内容（只获取标签容器）
    const printContent = document.querySelector('.delivery-label-container');
    if (!printContent) {
      console.error('未找到打印内容');
      message.error('未找到打印内容');
      return;
    }

    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('无法打开打印窗口');
      message.error('无法打开打印窗口');
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
      setTimeout(async () => {
        printWindow.print();
        printWindow.close();
        
        // 打印成功后调用接口更新打印状态
        try {
          const userInfo = getStorage<{ userName: string }>('userInfo');
          const operator = userInfo?.userName || 'unknown';
          
          await updatePrintStatus({
            id: parseInt(record.id),
            operator,
            btPrintCnt: 0,
            nbzPrintCnt: 0,
            wbzPrintCnt: 1,
          });
          
          message.success('打印成功');
        } catch (error) {
          console.error('更新打印状态失败:', error);
          message.warning('打印完成，但更新打印状态失败');
        }
      }, 250);
    };
  };

  // 生成二维码数据 - 使用接口返回的codeSN
  const generateQRData = () => {
    return outerPackagingData?.codeSN || record.codeSn || 'S0000012A001IP9302A01RG52PA01';
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : (
          <div className="delivery-label-container">
            <div className="label-header">
              <h3>供应商送货标签</h3>
            </div>

            <table className="delivery-table">
              <tbody>
                <tr>
                  <td className="label-cell">物料编码</td>
                  <td className="value-cell" colSpan={2}>
                    {outerPackagingData?.materialCode || record.materialCode || '0228A00179'}
                  </td>
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
                  <td className="value-cell multi-line" colSpan={2}>
                    {outerPackagingData?.nameModel || record.nameModel || '系统电源-3相交流380V-无'}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">数量</td>
                  <td className="value-cell">{outerPackagingData?.cnt || '-'}</td>
                  <td className="label-cell">单位</td>
                  <td className="value-cell">{outerPackagingData?.unit || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">供应商代码</td>
                  <td className="value-cell">
                    {outerPackagingData?.supplierCode || record.supplierCode || '-'}
                  </td>
                  <td className="label-cell">送货日期</td>
                  <td className="value-cell">
                    {formatDate(outerPackagingData?.deliveryDate || record.deliveryDate, 'YYYY-MM-DD') || '2024-09-01'}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">PO/行号</td>
                  <td className="value-cell">
                    {outerPackagingData?.poNo || '-'}
                  </td>
                  <td className="label-cell">送货单号</td>
                  <td className="value-cell">{outerPackagingData?.deliveryNo || '-'}</td>
                </tr>
                <tr>
                  <td className="label-cell">批号</td>
                  <td className="value-cell" colSpan={3}>
                    {outerPackagingData?.code09 || '-'}
                  </td>
                </tr>
                <tr>
                  <td className="label-cell">存储/清洁</td>
                  <td className="value-cell" colSpan={3}>
                    {outerPackagingData?.saveClean || 'S50'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="modal-footer">
          <Space>
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              loading={loading}
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