/**
 * 外包装弹窗组件 - 供应商送货标签
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Space, message, Tag } from 'antd';
import { PrinterOutlined, SettingOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import { scanNbzcode, updatePrintStatus, printWbzBarcode } from '@/services/print';
import { getStorage } from '@/utils/storage';
import { formatDate } from '@/utils/format';
import { usePrinterSelect } from '@/hooks';
import { PrinterSelectModal } from '@/components';
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
  
  // 打印机选择
  const printerSelect = usePrinterSelect();

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
    // 检查是否选择了打印机
    if (!printerSelect.selectedPrinter) {
      message.warning('请先选择打印机');
      printerSelect.openModal('600');
      return;
    }

    // 检查打印机是否在线
if (printerSelect.selectedPrinter.status !== 'ONLINE') {
    message.error('打印机离线，请重新选择');
    printerSelect.openModal('600');
    return;
    }

    console.log('打印外包装标签:', outerPackagingData || record);
    
    try {
      // 调用外包装码打印接口
      const userInfo = getStorage<{ userName: string }>('userInfo');
      const operator = userInfo?.userName || 'unknown';
      
      const printParams = {
        id: outerPackagingData?.id || parseInt(record.id),
        operator,
        codeSn: record.codeSn, // 使用详情接口的 codeSn 字段
        printerId: printerSelect.selectedPrinter.printerId,
        btPrintCnt: 0,
        nbzPrintCnt: 0,
        wbzPrintCnt: 1,
      };
      
      console.log('外包装码打印接口调用参数:', printParams);
      
      const response = await printWbzBarcode(printParams);
      
      console.log('外包装码打印接口响应:', response);
      
      message.success('打印指令已发送');
      
      // 更新打印状态
      try {
        await updatePrintStatus({
          id: outerPackagingData?.id || parseInt(record.id),
          operator,
          codeSn: record.codeSn,
          printerId: printerSelect.selectedPrinter.printerId,
          btPrintCnt: 0,
          nbzPrintCnt: 0,
          wbzPrintCnt: 1,
        });
        
        message.success(`使用 ${printerSelect.selectedPrinter.printerName} 打印成功`);
      } catch (error) {
        console.error('更新打印状态失败:', error);
        // 不影响打印流程，只记录错误
      }
    } catch (error) {
      console.error('打印接口调用失败:', error);
      message.error(`打印失败: ${error instanceof Error ? error.message : '未知错误'}`);
      return;
    }
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
            {/* 打印机选择按钮 */}
            <Button 
              icon={<SettingOutlined />}
              onClick={() => printerSelect.openModal('600')}
            >
              {printerSelect.selectedPrinter 
                ? `打印机: ${printerSelect.selectedPrinter.printerName}` 
                : '选择打印机'}
            </Button>
            
            {/* 显示打印机状态 */}
            {printerSelect.selectedPrinter && (
              <Tag color={printerSelect.selectedPrinter.status === 'ONLINE' ? 'success' : 'error'}>
                {printerSelect.selectedPrinter.status === 'ONLINE' ? '在线' : '离线'}
              </Tag>
            )}
            
            {/* 打印按钮 */}
            <Button 
              type="primary" 
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              loading={loading}
              disabled={!printerSelect.selectedPrinter}
            >
              打印
            </Button>
            <Button onClick={onClose}>
              取消
            </Button>
          </Space>
        </div>
      </div>
      
      {/* 打印机选择弹窗 */}
      <PrinterSelectModal
        visible={printerSelect.visible}
        onCancel={printerSelect.closeModal}
        onSelect={printerSelect.handleSelect}
        title="选择外包装码打印机"
        onlineOnly={true}
        department={printerSelect.department}
      />
    </Modal>
  );
};

export default OuterPackagingModal;