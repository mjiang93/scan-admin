/**
 * 批量更新图纸版本弹窗
 */
import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { batchEditDrawingVersion } from '@/services/print';
import { getUserInfo } from '@/utils/storage';

interface BatchDrawingVersionModalProps {
  visible: boolean;
  selectedIds: React.Key[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchDrawingVersionModal({
  visible,
  selectedIds,
  onClose,
  onSuccess,
}: BatchDrawingVersionModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前登录用户信息
      const userInfo = getUserInfo();
      const operator = userInfo?.id || userInfo?.userId || 'unknown';

      // 调用API
      await batchEditDrawingVersion({
        ids: selectedIds.map(id => Number(id)),
        drawingVersion: values.drawingVersion,
        operator,
      });

      message.success(`成功更新 ${selectedIds.length} 条记录的图纸版本`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('批量更新图纸版本失败:', error);
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="批量更新图纸版本"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          确定
        </Button>,
      ]}
      width={400}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="图纸版本"
          name="drawingVersion"
          rules={[
            { required: true, message: '请输入图纸版本' },
            { len: 3, message: '图纸版本必须是3位字符' },
          ]}
        >
          <Input
            placeholder="请输入3位字符"
            maxLength={3}
          />
        </Form.Item>
        
        <div style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
          将为选中的 {selectedIds.length} 条记录更新图纸版本
        </div>
      </Form>
    </Modal>
  );
}
