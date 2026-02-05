/**
 * 内包装条码弹窗组件
 */
import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, Space, message, Tag } from 'antd';
import { PrinterOutlined, SettingOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord } from '@/types/print';
import { scanBtcode, updatePrintStatus, printNbzBarcode } from '@/services/print';
import { getStorage } from '@/utils/storage';
import { usePrinterSelect } from '@/hooks';
import { PrinterSelectModal } from '@/components';
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
  
  // 打印机选择
  const printerSelect = usePrinterSelect();

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
    // 检查是否选择了打印机
    if (!printerSelect.selectedPrinter) {
      message.warning('请先选择打印机');
      printerSelect.openModal('600');
      return;
    }

    // 临时注释掉在线检查，用于调试接口
    if (printerSelect.selectedPrinter.status !== 'ONLINE') {
      message.error('打印机离线，请重新选择');
      printerSelect.openModal('600');
      return;
    }

    if (!printContentRef.current || !printData || !record) return;
    
    try {
      // 调用内包装码打印接口
      const userInfo = getStorage<{ userName: string }>('userInfo');
      const operator = userInfo?.userName || 'unknown';
      
      const printParams = {
        id: parseInt(recordId || record.id),
        operator,
        codeSn: record.codeSn, // 使用详情接口的 codeSn 字段
        printerId: printerSelect.selectedPrinter.printerId,
        btPrintCnt: 0,
        nbzPrintCnt: 1,
        wbzPrintCnt: 0,
      };
      
      console.log('内包装码打印接口调用参数:', printParams);
      
      const response = await printNbzBarcode(printParams);
      
      console.log('内包装码打印接口响应:', response);
      
      message.success('打印指令已发送');
      
      // 更新打印状态
      try {
        await updatePrintStatus({
          id: parseInt(recordId || record.id),
          operator,
          codeSn: record.codeSn,
          printerId: printerSelect.selectedPrinter.printerId,
          btPrintCnt: 0,
          nbzPrintCnt: 1,
          wbzPrintCnt: 0,
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
              disabled={loading || !printData || !printerSelect.selectedPrinter}
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
        title="选择内包装码打印机"
        onlineOnly={true}
        department={printerSelect.department}
      />
    </Modal>
  );
};

export default InnerPackagingModal;