/**
 * 本条码模板
 */
import { Barcode } from '../Barcode';
import type { PrintContentData } from '@/types/print';
import './PrintTemplate.css';

export interface ProductBarcodeTemplateProps {
  content: PrintContentData;
}

export function ProductBarcodeTemplate({ content }: ProductBarcodeTemplateProps) {
  return (
    <div className="print-template product-barcode-template">
      <div className="template-header">
        <h3 className="template-title">{content.title || '产品条码'}</h3>
      </div>
      
      <div className="template-body">
        <div className="barcode-container">
          <Barcode
            value={content.code}
            height={70}
            width={1.8}
            fontSize={12}
          />
        </div>
        
        <div className="product-info compact">
          <div className="info-row">
            <span className="info-label">产品:</span>
            <span className="info-value">{content.productName}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">批次:</span>
            <span className="info-value">{content.batchNo}</span>
          </div>
          
          {content.specification && (
            <div className="info-row">
              <span className="info-label">规格:</span>
              <span className="info-value">{content.specification}</span>
            </div>
          )}
          
          {content.productionDate && (
            <div className="info-row">
              <span className="info-label">生产:</span>
              <span className="info-value">{content.productionDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductBarcodeTemplate;
