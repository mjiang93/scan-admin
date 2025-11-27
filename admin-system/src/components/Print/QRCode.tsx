/**
 * 二维码组件
 */
import { QRCodeSVG } from 'qrcode.react';

export interface QRCodeProps {
  /** 二维码内容 */
  value: string;
  /** 尺寸 */
  size?: number;
  /** 背景色 */
  bgColor?: string;
  /** 前景色 */
  fgColor?: string;
  /** 纠错级别 */
  level?: 'L' | 'M' | 'Q' | 'H';
  /** 是否包含边距 */
  includeMargin?: boolean;
  /** Logo图片URL */
  imageSettings?: {
    src: string;
    height: number;
    width: number;
    excavate?: boolean;
  };
}

export function QRCode({
  value,
  size = 128,
  bgColor = '#ffffff',
  fgColor = '#000000',
  level = 'M',
  includeMargin = true,
  imageSettings,
}: QRCodeProps) {
  if (!value) {
    return <div className="qrcode-error">二维码内容不能为空</div>;
  }

  return (
    <QRCodeSVG
      value={value}
      size={size}
      bgColor={bgColor}
      fgColor={fgColor}
      level={level}
      includeMargin={includeMargin}
      imageSettings={imageSettings}
    />
  );
}

export default QRCode;
