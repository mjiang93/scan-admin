/**
 * 内包装条码模板
 */
import { Barcode } from '../Barcode';
import type { PrintContentData } from '@/types/print';
import './PrintTemplate.css';

export interface InnerBarcodeTemplateProps {
  content: PrintContentData;
}

export function InnerBarcodeTemplate({ content }: InnerBarcodeTemplateProps) {
  return (
    <div className="print-template inner-barcode-template">
      <div className="template-header">
        <h3 className="template-title">{content.title || '内包装条码'}</h3>
      </div>
      
      <div className="template-body">
        <div className="barcode-container">
          <Barcode
            value={content.code}
            height={60}
            width={1.5}
            fontSize={12}
          />
        </div>
        
        <div className="product-info">
          <div className="info-row">
            <span className="info-label">产品名称:</span>
            <span className="info-value">{content.productName}</span>
          </div>
          
          {content.specification && (
            <div className="info-row">
              <span className="info-label">规格:</span>
              <span className="info-value">{content.specification}</span>
            </div>
          )}
          
          {content.batchNo && (
            <div className="info-row">
              <span className="info-label">批次号:</span>
              <span className="info-value">{content.batchNo}</span>
            </div>
          )}
          
          {content.productionDate && (
            <div className="info-row">
              <span className="info-label">生产日期:</span>
              <span className="info-value">{content.productionDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InnerBarcodeTemplate;
