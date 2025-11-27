/**
 * 打印组件导出
 */
export { Barcode } from './Barcode';
export type { BarcodeProps } from './Barcode';

export { QRCode } from './QRCode';
export type { QRCodeProps } from './QRCode';

export { PrintTemplate, getTemplateComponent } from './PrintTemplate';
export type { PrintTemplateProps } from './PrintTemplate';

export {
  InnerBarcodeTemplate,
  OuterBarcodeTemplate,
  ProductBarcodeTemplate,
  QRCodeTemplate,
} from './templates';
