/**
 * 样式工具函数
 */

/**
 * 溢出处理类型
 */
export type OverflowType = 'auto' | 'hidden' | 'scroll' | 'visible';

/**
 * 溢出处理配置
 */
export interface OverflowConfig {
  x?: OverflowType;
  y?: OverflowType;
}

/**
 * 容器尺寸配置
 */
export interface ContainerDimensions {
  width: number;
  height: number;
  contentWidth: number;
  contentHeight: number;
}

/**
 * 获取内容溢出处理的CSS类名
 * 根据容器和内容尺寸自动判断是否需要滚动
 * 
 * @param dimensions - 容器和内容尺寸
 * @returns CSS类名
 */
export function getOverflowClass(dimensions: ContainerDimensions): string {
  const { width, height, contentWidth, contentHeight } = dimensions;
  
  const overflowX = contentWidth > width;
  const overflowY = contentHeight > height;
  
  if (overflowX && overflowY) {
    return 'overflow-auto';
  } else if (overflowX) {
    return 'overflow-x-auto';
  } else if (overflowY) {
    return 'overflow-y-auto';
  }
  
  return '';
}

/**
 * 获取溢出处理的CSS样式对象
 * 
 * @param config - 溢出处理配置
 * @returns CSS样式对象
 */
export function getOverflowStyle(config: OverflowConfig): React.CSSProperties {
  const style: React.CSSProperties = {};
  
  if (config.x) {
    style.overflowX = config.x;
  }
  
  if (config.y) {
    style.overflowY = config.y;
  }
  
  return style;
}

/**
 * 判断内容是否溢出容器
 * 
 * @param dimensions - 容器和内容尺寸
 * @returns 溢出状态对象
 */
export function checkOverflow(dimensions: ContainerDimensions): { x: boolean; y: boolean } {
  const { width, height, contentWidth, contentHeight } = dimensions;
  
  return {
    x: contentWidth > width,
    y: contentHeight > height,
  };
}

/**
 * 获取自适应内容的CSS类名
 * 根据内容是否溢出返回适当的类名
 * 
 * @param dimensions - 容器和内容尺寸
 * @returns CSS类名数组
 */
export function getAdaptiveClasses(dimensions: ContainerDimensions): string[] {
  const classes: string[] = [];
  const overflow = checkOverflow(dimensions);
  
  if (overflow.x || overflow.y) {
    classes.push('content-overflow-container');
  }
  
  if (overflow.x) {
    classes.push('content-overflow-x');
  }
  
  if (overflow.y) {
    classes.push('content-overflow-y');
  }
  
  return classes;
}

/**
 * 响应式断点
 */
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
} as const;

/**
 * 判断当前屏幕宽度是否为移动端
 * 
 * @param width - 屏幕宽度
 * @returns 是否为移动端
 */
export function isMobile(width: number): boolean {
  return width < BREAKPOINTS.md;
}

/**
 * 判断当前屏幕宽度是否为平板
 * 
 * @param width - 屏幕宽度
 * @returns 是否为平板
 */
export function isTablet(width: number): boolean {
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

/**
 * 判断当前屏幕宽度是否为桌面端
 * 
 * @param width - 屏幕宽度
 * @returns 是否为桌面端
 */
export function isDesktop(width: number): boolean {
  return width >= BREAKPOINTS.lg;
}

/**
 * 获取当前断点名称
 * 
 * @param width - 屏幕宽度
 * @returns 断点名称
 */
export function getBreakpoint(width: number): keyof typeof BREAKPOINTS {
  if (width < BREAKPOINTS.xs) return 'xs';
  if (width < BREAKPOINTS.sm) return 'sm';
  if (width < BREAKPOINTS.md) return 'md';
  if (width < BREAKPOINTS.lg) return 'lg';
  if (width < BREAKPOINTS.xl) return 'xl';
  return 'xxl';
}
