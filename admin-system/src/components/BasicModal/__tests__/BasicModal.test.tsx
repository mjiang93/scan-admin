/**
 * BasicModal 组件测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import BasicModal from '../index';

describe('BasicModal', () => {
  // **Feature: admin-management-system, Property 42: 弹窗自定义能力**
  it('should support custom content and callback functions for any modal instance', async () => {
    await fc.assert(
      fc.asyncProperty(
        // 生成弹窗配置
        fc.record({
          title: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
          content: fc.string({ minLength: 1, maxLength: 100 }),
          width: fc.option(fc.oneof(
            fc.integer({ min: 200, max: 1000 }),
            fc.constantFrom('50%', '80%', '100%')
          ), { nil: undefined }),
        }),
        async ({ title, content, width }) => {
          const onOk = vi.fn();
          const onCancel = vi.fn();

          const { unmount } = render(
            <BasicModal
              open={true}
              title={title}
              onOk={onOk}
              onCancel={onCancel}
              width={width}
            >
              <div data-testid="modal-content">{content}</div>
            </BasicModal>
          );

          // 验证1: 自定义内容应该被渲染
          await waitFor(() => {
            const contentElement = screen.getByTestId('modal-content');
            expect(contentElement).toBeTruthy();
            expect(contentElement.textContent).toBe(content);
          });

          // 验证2: 自定义标题应该被渲染（如果提供）
          if (title) {
            await waitFor(() => {
              const titleElement = document.querySelector('.ant-modal-title');
              expect(titleElement?.textContent).toBe(title);
            });
          }

          // 验证3: 确认回调应该可以被触发
          const okButton = document.querySelector('.ant-modal-footer .ant-btn-primary');
          if (okButton) {
            fireEvent.click(okButton);
            expect(onOk).toHaveBeenCalled();
          }

          // 验证4: 取消回调应该可以被触发
          onOk.mockClear();
          onCancel.mockClear();
          
          const cancelButton = document.querySelector('.ant-modal-footer .ant-btn:not(.ant-btn-primary)');
          if (cancelButton) {
            fireEvent.click(cancelButton);
            expect(onCancel).toHaveBeenCalled();
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  // 单元测试：基本渲染
  it('should render modal with title and content', async () => {
    render(
      <BasicModal open={true} title="测试标题">
        <div data-testid="test-content">测试内容</div>
      </BasicModal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('test-content')).toBeTruthy();
      expect(document.querySelector('.ant-modal-title')?.textContent).toBe('测试标题');
    });
  });

  // 单元测试：确认回调
  it('should call onOk when confirm button is clicked', async () => {
    const onOk = vi.fn();
    
    render(
      <BasicModal open={true} title="确认测试" onOk={onOk}>
        <div>内容</div>
      </BasicModal>
    );

    await waitFor(() => {
      const okButton = document.querySelector('.ant-modal-footer .ant-btn-primary');
      expect(okButton).toBeTruthy();
    });

    const okButton = document.querySelector('.ant-modal-footer .ant-btn-primary');
    if (okButton) {
      fireEvent.click(okButton);
      expect(onOk).toHaveBeenCalledTimes(1);
    }
  });

  // 单元测试：取消回调
  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    
    render(
      <BasicModal open={true} title="取消测试" onCancel={onCancel}>
        <div>内容</div>
      </BasicModal>
    );

    await waitFor(() => {
      const cancelButton = document.querySelector('.ant-modal-footer .ant-btn:not(.ant-btn-primary)');
      expect(cancelButton).toBeTruthy();
    });

    const cancelButton = document.querySelector('.ant-modal-footer .ant-btn:not(.ant-btn-primary)');
    if (cancelButton) {
      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    }
  });

  // 单元测试：自定义宽度
  it('should apply custom width', async () => {
    render(
      <BasicModal open={true} title="宽度测试" width={800}>
        <div>内容</div>
      </BasicModal>
    );

    await waitFor(() => {
      const modal = document.querySelector('.ant-modal');
      expect(modal).toBeTruthy();
      expect((modal as HTMLElement).style.width).toBe('800px');
    });
  });

  // 单元测试：自定义 footer
  it('should render custom footer', async () => {
    render(
      <BasicModal 
        open={true} 
        title="Footer测试" 
        footer={<div data-testid="custom-footer">自定义底部</div>}
      >
        <div>内容</div>
      </BasicModal>
    );

    await waitFor(() => {
      expect(screen.getByTestId('custom-footer')).toBeTruthy();
    });
  });

  // 单元测试：关闭状态
  it('should not render when open is false', () => {
    render(
      <BasicModal open={false} title="关闭测试">
        <div data-testid="hidden-content">隐藏内容</div>
      </BasicModal>
    );

    expect(screen.queryByTestId('hidden-content')).toBeNull();
  });
});
