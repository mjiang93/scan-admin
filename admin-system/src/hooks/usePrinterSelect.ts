/**
 * 打印机选择 Hook
 * 提供打开打印机选择弹窗的便捷方法
 */
import { useState, useCallback } from 'react';
import type { PrinterInfo } from '@/types/print';

export interface UsePrinterSelectReturn {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 选中的打印机 */
  selectedPrinter: PrinterInfo | null;
  /** 部门参数 */
  department?: string;
  /** 打开弹窗 */
  openModal: (department?: string) => void;
  /** 关闭弹窗 */
  closeModal: () => void;
  /** 选择打印机 */
  handleSelect: (printer: PrinterInfo) => void;
  /** 清除选择 */
  clearSelection: () => void;
}

/**
 * 打印机选择 Hook
 * 
 * @example
 * ```tsx
 * const { visible, selectedPrinter, openModal, closeModal, handleSelect } = usePrinterSelect();
 * 
 * // 打开选择弹窗
 * <Button onClick={openModal}>选择打印机</Button>
 * 
 * // 使用弹窗组件
 * <PrinterSelectModal
 *   visible={visible}
 *   onCancel={closeModal}
 *   onSelect={handleSelect}
 * />
 * 
 * // 使用选中的打印机
 * {selectedPrinter && (
 *   <div>已选择: {selectedPrinter.printerName}</div>
 * )}
 * ```
 */
export function usePrinterSelect(): UsePrinterSelectReturn {
  const [visible, setVisible] = useState(false);
  const [selectedPrinter, setSelectedPrinter] = useState<PrinterInfo | null>(null);
  const [department, setDepartment] = useState<string | undefined>(undefined);

  const openModal = useCallback((dept?: string) => {
    setDepartment(dept);
    setVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSelect = useCallback((printer: PrinterInfo) => {
    setSelectedPrinter(printer);
    setVisible(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPrinter(null);
  }, []);

  return {
    visible,
    selectedPrinter,
    department,
    openModal,
    closeModal,
    handleSelect,
    clearSelection,
  };
}
