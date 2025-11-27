/**
 * 条码组件
 */
import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export interface BarcodeProps {
  /** 条码内容 */
  value: string;
  /** 条码格式 */
  format?: string;
  /** 宽度 */
  width?: number;
  /** 高度 */
  height?: number;
  /** 是否显示文本 */
  displayValue?: boolean;
  /** 字体大小 */
  fontSize?: number;
  /** 文本位置 */
  textPosition?: 'bottom' | 'top';
  /** 背景色 */
  background?: string;
  /** 线条颜色 */
  lineColor?: string;
  /** 边距 */
  margin?: number;
}

export function Barcode({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 14,
  textPosition = 'bottom',
  background = '#ffffff',
  lineColor = '#000000',
  margin = 10,
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue,
          fontSize,
          textPosition,
          background,
          lineColor,
          margin,
        });
      } catch (error) {
        console.error('Failed to generate barcode:', error);
      }
    }
  }, [value, format, width, height, displayValue, fontSize, textPosition, background, lineColor, margin]);

  if (!value) {
    return <div className="barcode-error">条码内容不能为空</div>;
  }

  return <svg ref={svgRef} />;
}

export default Barcode;
