/**
 * 公共组件统一导出
 */

export { default as BasicTable } from './BasicTable';
export { default as BasicForm } from './BasicForm';
export { default as BasicModal } from './BasicModal';
export { default as SearchForm } from './SearchForm';
export { default as BasicUpload } from './Upload';
export { default as AuthButton } from './AuthButton';
export { ErrorBoundary } from './ErrorBoundary';
export { GlobalLoading, PageLoading } from './GlobalLoading';

export type { BasicTableProps } from './BasicTable';
export type { BasicFormProps } from './BasicForm';
export type { BasicModalProps } from './BasicModal';
export type { SearchFormProps } from './SearchForm';
export type { BasicUploadProps } from './Upload';
export type { AuthButtonProps } from './AuthButton';

// Print components
export {
  Barcode,
  QRCode,
  PrintTemplate,
  getTemplateComponent,
  InnerBarcodeTemplate,
  OuterBarcodeTemplate,
  ProductBarcodeTemplate,
  QRCodeTemplate,
} from './Print';
export type { BarcodeProps, QRCodeProps, PrintTemplateProps } from './Print';

// Printer components
export { default as PrinterSelectModal } from './PrinterSelectModal';
export type { PrinterSelectModalProps } from './PrinterSelectModal';
