/**
 * 基础弹窗组件
 */
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import type { ReactNode } from 'react';

export interface BasicModalProps extends ModalProps {
  // 弹窗标题
  title?: string;
  // 弹窗内容
  children: ReactNode;
  // 是否显示
  open: boolean;
  // 确认回调
  onOk?: () => void | Promise<void>;
  // 取消回调
  onCancel?: () => void;
  // 弹窗宽度
  width?: number | string;
  // 是否显示底部按钮
  footer?: ReactNode;
}

export default function BasicModal({
  title,
  children,
  open,
  onOk,
  onCancel,
  width = 520,
  footer,
  ...restProps
}: BasicModalProps) {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={width}
      footer={footer}
      destroyOnHidden
      {...restProps}
    >
      {children}
    </Modal>
  );
}
