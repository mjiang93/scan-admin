/**
 * 二维码模板
 */
import { QRCode } from '../QRCode';
import type { PrintContentData } from '@/types/print';
import './PrintTemplate.css';

export interface QRCodeTemplateProps {
  content: PrintContentData;
}

export function QRCodeTemplate({ content }: QRCodeTemplateProps) {
  return (
    <div className="print-template qrcode-template">
      <div className="template-header">
        <h3 className="template-title">{content.title || '二维码'}</h3>
      </div>
      
      <div className="template-body">
        <div className="qrcode-container">
          <QRCode
            value={content.code}
            size={150}
            level="M"
          />
        </div>
        
        {content.productName && (
          <div className="product-info centered">
            <div className="info-row">
              <span className="info-value">{content.productName}</span>
            </div>
            
            {content.specification && (
              <div className="info-row">
                <span className="info-value small">{content.specification}</span>
              </div>
            )}
          </div>
        )}
        
        {content.remark && (
          <div className="template-footer">
            <span className="remark small">{content.remark}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default QRCodeTemplate;
