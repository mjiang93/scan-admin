/**
 * 条码二维码弹窗组件
 */
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, message, Space, Spin, Tag } from 'antd';
import { PrinterOutlined, SettingOutlined } from '@ant-design/icons';
import JsBarcode from 'jsbarcode';
import { QRCodeSVG } from 'qrcode.react';
import type { BarcodeRecord, BtPrintData } from '@/types/print';
import { getBtPrintInfo, updatePrintStatus, printBtBarcode } from '@/services/print';
import { getStorage } from '@/utils/storage';
import { usePrinterSelect } from '@/hooks';
import { PrinterSelectModal } from '@/components';
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
  const barcodeSvgRefs = useRef<(SVGSVGElement | null)[]>([]);
  const printAreaRef = useRef<HTMLDivElement>(null);
  
  // 打印机选择
  const printerSelect = usePrinterSelect();

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
        const data = response.data as {
          pnCode?: string;
          revCode?: string;
          modelCode?: string;
          codeSNFull?: string;
          codeSN?: string;
          fjList?: Array<{ fjCode?: string } | string>;
        };
        
        // 处理 fjList - 从对象数组中提取 fjCode 字段
        let fjListArray: string[] = [];
        if (Array.isArray(data.fjList)) {
          fjListArray = data.fjList.map((item: { fjCode?: string } | string) => {
            // 如果是对象，提取 fjCode 字段
            if (typeof item === 'object' && item !== null && 'fjCode' in item && item.fjCode) {
              return String(item.fjCode);
            }
            // 如果是字符串，直接返回
            return String(item || '');
          });
        }
        
        const safeData: BtPrintData = {
          pnCode: String(data.pnCode || ''),
          revCode: String(data.revCode || ''),
          modelCode: String(data.modelCode || ''),
          codeSNFull: String(data.codeSNFull || data.codeSN || ''),
          codeSN: String(data.codeSN || ''),
          fjList: fjListArray,
        };
        
        setPrintData(safeData);
      } else {
        message.error(response.errorMsg || '获取打印数据失败');
      }
    } catch (error) {
      console.error('加载打印数据失败:', error);
      message.error('加载打印数据失败');
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

  // 生成条形码 SVG - 使用矢量格式，打印永不模糊
  useEffect(() => {
    if (visible && printData && printData.fjList && printData.fjList.length > 0) {
      try {
        printData.fjList.forEach((barcodeValue, index) => {
          const svg = barcodeSvgRefs.current[index];
          if (svg && barcodeValue) {
            // 使用 SVG 格式生成条形码，矢量图形打印永不模糊
            JsBarcode(svg, barcodeValue, {
              format: 'CODE128',
              width: 0.5,              // 条宽度（最小化以适应48mm宽度）
              height: 15,            // 条高度（减小以适应6mm标签）
              displayValue: false,   // 不在条形码内显示文字
              margin: 0,           // 最小边距
              background: '#ffffff',
              lineColor: '#000000',
            });
          }
        });
      } catch (error) {
        console.error('生成条形码失败:', error);
        message.error('生成条形码失败');
      }
    }
  }, [visible, printData]);

  // 打印功能 - 使用 SVG 矢量格式，永不模糊
  const handlePrint = async () => {
    // 检查是否选择了打印机
    if (!printerSelect.selectedPrinter) {
      message.warning('请先选择打印机');
      printerSelect.openModal('300');
      return;
    }

    // 检查打印机是否在线
    if (printerSelect.selectedPrinter.status !== 'ONLINE') {
      message.error('打印机离线，请重新选择');
      printerSelect.openModal('300');
      return;
    }

    if (!printAreaRef.current || !record || !printData) return;
    
    try {
      // 调用本体码打印接口
      const userInfo = getStorage<{ userName: string }>('userInfo');
      const operator = userInfo?.userName || 'unknown';
      
      const printParams = {
        id: parseInt(record.id),
        operator,
        codeSn: record.codeSn, // 使用详情接口的 codeSn 字段
        printerId: printerSelect.selectedPrinter.printerId,
        btPrintCnt: 1,
        nbzPrintCnt: 0,
        wbzPrintCnt: 0,
      };
      
      console.log('本体码打印接口调用参数:', printParams);
      
      const response = await printBtBarcode(printParams);
      
      console.log('本体码打印接口响应:', response);
      
      message.success('打印指令已发送');
      
      // 更新打印状态
      try {
        await updatePrintStatus({
          id: parseInt(record.id),
          operator,
          codeSn: record.codeSn,
          printerId: printerSelect.selectedPrinter.printerId,
          btPrintCnt: 1,
          nbzPrintCnt: 0,
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

  if (!record) return null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={
        <div className="modal-footer">
          <Space>
            {/* 打印机选择按钮 */}
            <Button 
              icon={<SettingOutlined />}
              onClick={() => printerSelect.openModal('300')}
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
                    value={String(printData.codeSNFull || printData.codeSN || '')}
                    size={60}
                    level="M"
                  />
                </div>
                <div className="product-info">
                  <div className="info-line">
                    <div className='info-line1'>
                      <div className="info-label">PN:</div>
                    <div className="info-value">{String(printData.pnCode || '')}</div>
                    </div>
                    <div className='info-line1'>
                      <div className="info-label">Rev:</div>
                    <div className="info-value">{String(printData.revCode || '')}</div>
                    </div>
                  </div>
                  <div className="info-line">
                    <div className="info-label">Model:</div>
                    <div className="info-value">{String(printData.modelCode || '')}</div>
                  </div>
                  <div className="info-line">
                    <div className="info-label">SN:</div>
                    <div className="info-value">{String(printData.codeSN || '')}</div>
                  </div>
                </div>
              </div>

              {/* 条形码区域 */}
              <div className="barcode-section">
                {printData.fjList && Array.isArray(printData.fjList) && printData.fjList.map((barcodeValue, index) => (
                  <div key={index} className="barcode-item">
                    <svg ref={(el) => { barcodeSvgRefs.current[index] = el; }}></svg>
                    <div className="barcode-text">{String(barcodeValue || '')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Spin>
      
      {/* 打印机选择弹窗 */}
      <PrinterSelectModal
        visible={printerSelect.visible}
        onCancel={printerSelect.closeModal}
        onSelect={printerSelect.handleSelect}
        title="选择本体码打印机"
        onlineOnly={true}
        department={printerSelect.department}
      />
    </Modal>
  );
};

export default BarcodeModal;