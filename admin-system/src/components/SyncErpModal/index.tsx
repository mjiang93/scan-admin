/**
 * 同步ERP系统弹窗
 */
import { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import { syncErpSystem } from '@/services/print';
import { getUserInfo } from '@/utils/storage';

interface SyncErpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SyncErpModal({
  visible,
  onClose,
  onSuccess,
}: SyncErpModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前登录用户信息
      const userInfo = getUserInfo();
      const operator = userInfo?.id || userInfo?.userId || 'unknown';

      // 调用同步ERP的API
      const response = await syncErpSystem({ 
        projectCode: values.productCode,
        operator 
      });

      if (response.success) {
        message.success('同步ERP系统成功');
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.errorMsg || '同步失败');
      }
    } catch (error) {
      console.error('同步ERP系统失败:', error);
      message.error('同步失败，请重试');
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
      title="同步ERP系统"
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
          label="产品编码"
          name="productCode"
          rules={[
            { required: true, message: '请输入产品编码' },
          ]}
        >
          <Input placeholder="请输入产品编码" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
