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
      console.log('送货日期原始值:', data.deliveryDate);
      console.log('送货日期类型:', typeof data.deliveryDate);
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
    const printContent = document.querySelector('.outer-packaging-delivery-label-container');
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
              size: 100mm 70mm;
              margin: 0;
            }
            
            html, body {
              margin: 0;
              padding: 0;
            }
            
            body {
              padding: 3mm;
            }
            
            .outer-packaging-delivery-label-container {
              background: #fff;
              position: relative;
              width: 94mm;
              height: 64mm;
            }
            
            .outer-packaging-delivery-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              border: 2px solid #333;
            }
            
            .outer-packaging-table-header {
              border: 1px solid #333;
              padding: 6px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              background-color: #fff;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .outer-packaging-delivery-table td {
              border: 1px solid #333;
              padding: 3px 5px;
              vertical-align: middle;
              height: auto;
              line-height: 1.3;
            }
            
            .outer-packaging-label-cell {
              background-color: #f5f5f5;
              font-weight: bold;
              width: 78px;
              text-align: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .outer-packaging-value-cell {
              text-align: center;
            }
            
            .outer-packaging-value-cell.outer-packaging-multi-line {
              line-height: 1.3;
              padding: 3px 5px;
            }
            
            .outer-packaging-qr-section {
              text-align: center;
              vertical-align: middle;
              position: relative;
              padding: 6px;
            }
            
            .outer-packaging-qr-code-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3px;
              height: 100%;
              justify-content: center;
            }
            
            .outer-packaging-qr-code {
              width: 70px;
              height: 70px;
              border: 1px solid #333;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #fff;
              padding: 3px;
            }
            
            .outer-packaging-qr-code svg {
              width: 64px;
              height: 64px;
            }
            
            @media print {
              body {
                padding: 3mm;
              }
              
              .outer-packaging-delivery-label-container {
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
    
    // 等待内容加载完成后打印（增加延迟确保QR码渲染完成）
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
          
          // message.success('打印成功');
        } catch (error) {
          console.error('更新打印状态失败:', error);
          message.warning('打印完成，但更新打印状态失败');
        }
      }, 500); // 增加延迟时间，确保QR码完全渲染
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
        <div className="outer-packaging-header-info">
          <div className="outer-packaging-title">供应商送货标签</div>
          <div className="outer-packaging-subtitle">
            外包装条码<br />
            尺寸：100mm*70mm
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
        ) : (
          <div className="outer-packaging-delivery-label-container">
            <table className="outer-packaging-delivery-table">
              <thead>
                <tr>
                  <th colSpan={4} className="outer-packaging-table-header">供应商送货标签</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="outer-packaging-label-cell">物料编码</td>
                  <td className="outer-packaging-value-cell" colSpan={2}>
                    {outerPackagingData?.materialCode || record.materialCode || ''}
                  </td>
                  <td className="outer-packaging-qr-section" rowSpan={2}>
                    <div className="outer-packaging-qr-code-container">
                      <div className="outer-packaging-qr-code">
                        <QRCodeSVG
                          value={generateQRData()}
                          size={64}
                          level="M"
                          fgColor="#000000"
                          bgColor="#ffffff"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">名称型号</td>
                  <td className="outer-packaging-value-cell outer-packaging-multi-line" colSpan={2}>
                    {outerPackagingData?.nameModel || record.nameModel || ''}
                  </td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">数量</td>
                  <td className="outer-packaging-value-cell">{outerPackagingData?.cnt || ''}</td>
                  <td className="outer-packaging-label-cell">单位</td>
                  <td className="outer-packaging-value-cell">
                    {outerPackagingData?.unit || ''}
                    {/* PCS */}
                  </td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">供应商代码</td>
                  <td className="outer-packaging-value-cell">
                    {outerPackagingData?.supplierCode || record.supplierCode || ''}
                  </td>
                  <td className="outer-packaging-label-cell">送货日期</td>
                  <td className="outer-packaging-value-cell">
                    {(() => {
                      const dateValue = outerPackagingData?.deliveryDate || record.deliveryDate;
                      if (!dateValue) return '';
                      
                      // 如果是数字类型的时间戳，直接使用
                      if (typeof dateValue === 'number') {
                        return formatDate(dateValue, 'YYYY-MM-DD');
                      }
                      
                      // 如果是字符串，尝试转换为数字
                      if (typeof dateValue === 'string') {
                        const timestamp = parseInt(dateValue, 10);
                        if (!isNaN(timestamp)) {
                          return formatDate(timestamp, 'YYYY-MM-DD');
                        }
                        // 如果不是纯数字字符串，直接作为日期字符串处理
                        return formatDate(dateValue, 'YYYY-MM-DD');
                      }
                      
                      return formatDate(dateValue, 'YYYY-MM-DD');
                    })()}
                  </td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">PO/行号</td>
                  <td className="outer-packaging-value-cell">
                    {outerPackagingData?.poNo || ''}
                  </td>
                  <td className="outer-packaging-label-cell">送货单号</td>
                  <td className="outer-packaging-value-cell">{outerPackagingData?.deliveryNo || ''}</td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">批号</td>
                  <td className="outer-packaging-value-cell" colSpan={3}>
                    {outerPackagingData?.code09 || ''}
                  </td>
                </tr>
                <tr>
                  <td className="outer-packaging-label-cell">存储/清洁</td>
                  <td className="outer-packaging-value-cell" colSpan={3}>
                    {outerPackagingData?.saveClean || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="outer-packaging-modal-footer">
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