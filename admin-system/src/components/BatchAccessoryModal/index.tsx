/**
 * 批量添加附件弹窗
 */
import { useState } from 'react';
import { Modal, Form, InputNumber, message } from 'antd';
import { batchEditAccessory } from '@/services/print';
import './index.css';

interface BatchAccessoryModalProps {
  visible: boolean;
  selectedIds: React.Key[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchAccessoryModal({
  visible,
  selectedIds,
  onClose,
  onSuccess,
}: BatchAccessoryModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前用户信息
      const cachedLoginData = localStorage.getItem('loginData');
      let operator = 'unknown';
      
      if (cachedLoginData) {
        try {
          const loginData = JSON.parse(cachedLoginData);
          operator = loginData.userId || 'unknown';
        } catch (error) {
          console.error('解析用户信息失败:', error);
        }
      }

      // 转换ID为数字类型
      const ids = selectedIds.map(id => Number(id));

      await batchEditAccessory({
        ids,
        operator,
        accessoryCnt: values.accessoryCount,
      });

      message.success(`成功为 ${selectedIds.length} 条记录添加了 ${values.accessoryCount} 件附件`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('批量添加附件失败:', error);
      message.error('添加附件失败，请重试');
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
      title="批量分配附件"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确定"
      cancelText="取消"
      width={400}
      className="batch-accessory-modal"
    >
      <div className="selected-info">
        <p>已选择 {selectedIds.length} 条记录</p>
      </div>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{ accessoryCount: 5 }}
      >
        <Form.Item
          label="附件个数"
          name="accessoryCount"
          rules={[
            { required: true, message: '请输入附件个数' },
            { type: 'number', min: 1, max: 999, message: '附件个数必须在1-999之间' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="请输入附件个数"
            min={1}
            max={999}
            precision={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}