/**
 * 批量修改送货时间弹窗
 */
import { useState } from 'react';
import { Modal, Form, DatePicker, Button, message } from 'antd';
import { batchEditDeliveryDate } from '@/services/print';
import { getUserInfo } from '@/utils/storage';
import dayjs from 'dayjs';

interface BatchDeliveryModalProps {
  visible: boolean;
  selectedIds: React.Key[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function BatchDeliveryModal({
  visible,
  selectedIds,
  onClose,
  onSuccess,
}: BatchDeliveryModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 获取当前登录用户信息
      const userInfo = getUserInfo();
      const operator = userInfo?.id || userInfo?.userId || 'unknown';

      // 格式化日期
      const deliveryDate = values.deliveryDate.format('YYYY-MM-DD');

      // 调用API
      await batchEditDeliveryDate({
        ids: selectedIds.map(id => Number(id)),
        deliveryDate,
        operator,
      });

      message.success(`成功修改 ${selectedIds.length} 条记录的送货时间`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('批量修改送货时间失败:', error);
      message.error('修改失败，请重试');
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
      title="批量修改送货时间"
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
        initialValues={{
          deliveryDate: dayjs(),
        }}
      >
        <Form.Item
          label="送货日期"
          name="deliveryDate"
          rules={[
            { required: true, message: '请选择送货日期' },
          ]}
        >
          <DatePicker
            style={{ width: '100%' }}
            placeholder="请选择送货日期"
            format="YYYY-MM-DD"
          />
        </Form.Item>
        
        <div style={{ color: '#666', fontSize: '14px', marginTop: '16px' }}>
          将为选中的 {selectedIds.length} 条记录修改送货时间
        </div>
      </Form>
    </Modal>
  );
}