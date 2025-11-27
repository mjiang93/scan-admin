/**
 * 打印模板组件 - 根据模板类型渲染对应模板
 */
import { PrintTemplateType, type PrintContentData } from '@/types/print';
import {
  InnerBarcodeTemplate,
  OuterBarcodeTemplate,
  ProductBarcodeTemplate,
  QRCodeTemplate,
} from './templates';

export interface PrintTemplateProps {
  /** 模板类型 */
  templateType: PrintTemplateType;
  /** 打印内容 */
  content: PrintContentData;
}

/**
 * 根据模板类型获取对应的模板组件
 */
export function getTemplateComponent(
  templateType: PrintTemplateType
): React.ComponentType<{ content: PrintContentData }> | null {
  const templateMap: Record<PrintTemplateType, React.ComponentType<{ content: PrintContentData }>> = {
    [PrintTemplateType.INNER_BARCODE]: InnerBarcodeTemplate,
    [PrintTemplateType.OUTER_BARCODE]: OuterBarcodeTemplate,
    [PrintTemplateType.PRODUCT_BARCODE]: ProductBarcodeTemplate,
    [PrintTemplateType.QR_CODE]: QRCodeTemplate,
  };

  return templateMap[templateType] || null;
}

/**
 * 打印模板组件
 */
export function PrintTemplate({ templateType, content }: PrintTemplateProps) {
  const TemplateComponent = getTemplateComponent(templateType);

  if (!TemplateComponent) {
    return (
      <div className="print-template-error">
        未知的模板类型: {templateType}
      </div>
    );
  }

  return <TemplateComponent content={content} />;
}

export default PrintTemplate;
