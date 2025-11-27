/**
 * 外包装条码模板
 */
import { Barcode } from '../Barcode';
import type { PrintContentData } from '@/types/print';
import './PrintTemplate.css';

export interface OuterBarcodeTemplateProps {
  content: PrintContentData;
}

export function OuterBarcodeTemplate({ content }: OuterBarcodeTemplateProps) {
  return (
    <div className="print-template outer-barcode-template">
      <div className="template-header">
        <h3 className="template-title">{content.title || '外包装条码'}</h3>
      </div>
      
      <div className="template-body">
        <div className="barcode-container large">
          <Barcode
            value={content.code}
            height={80}
            width={2}
            fontSize={14}
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
          
          <div className="info-row">
            <span className="info-label">数量:</span>
            <span className="info-value">
              {content.quantity} {content.unit || '件'}
            </span>
          </div>
          
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
          
          {content.expiryDate && (
            <div className="info-row">
              <span className="info-label">有效期至:</span>
              <span className="info-value">{content.expiryDate}</span>
            </div>
          )}
        </div>
        
        {content.remark && (
          <div className="template-footer">
            <span className="remark">备注: {content.remark}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default OuterBarcodeTemplate;
