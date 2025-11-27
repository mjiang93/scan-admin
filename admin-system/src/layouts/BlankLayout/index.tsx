/**
 * 空白布局
 */
import type { ReactNode } from 'react';

interface BlankLayoutProps {
  children: ReactNode;
}

export default function BlankLayout({ children }: BlankLayoutProps) {
  return <div style={{ width: '100%', height: '100vh' }}>{children}</div>;
}
