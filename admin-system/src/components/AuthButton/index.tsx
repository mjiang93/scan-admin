/**
 * 权限按钮组件
 */
import { Button } from 'antd';
import type { ButtonProps } from 'antd';
import { hasButtonPermission } from '@/utils/permission';
import type { ReactNode } from 'react';

export interface AuthButtonProps extends ButtonProps {
  // 所需权限
  permission: string;
  // 按钮内容
  children: ReactNode;
}

export default function AuthButton({ permission, children, ...restProps }: AuthButtonProps) {
  // 检查权限
  const hasPermission = hasButtonPermission(permission);

  // 无权限则不渲染
  if (!hasPermission) {
    return null;
  }

  return <Button {...restProps}>{children}</Button>;
}
