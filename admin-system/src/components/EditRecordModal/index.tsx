/**
 * 编辑记录弹窗组件
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Button,
  message,
  Row,
  Col,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import { updateBarcodeRecord } from '@/services/print';
import type { BarcodeRecord, ApiBarcodeRecord } from '@/types/print';
import { useUserStore } from '@/store';
import './index.css';

interface EditRecordModalProps {
  visible: boolean;
  record: BarcodeRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EditRecordModal: React.FC<EditRecordModalProps> = ({
  visible,
  record,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const userInfo = useUserStore((state) => state.userInfo);

  // 当弹窗打开时，填充表单数据
  useEffect(() => {
    if (visible && record) {
      // 安全地转换日期（时间戳转dayjs）
      const parseTimestamp = (timestamp: string | undefined | null) => {
        if (!timestamp) return undefined;
        try {
          const date = dayjs(parseInt(timestamp));
          return date.isValid() ? date : undefined;
        } catch {
          return undefined;
        }
      };

      // 直接使用record，只处理特殊字段
      form.setFieldsValue({
        ...record,
        productionDateStart: parseTimestamp(record.productionDateStart),
        productionDateEnd: parseTimestamp(record.productionDateEnd),
        deliveryDate: parseTimestamp(record.deliveryDate),
      });
    }
  }, [visible, record, form]);

  // 处理确定按钮
  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (!record) {
        message.error('记录数据不存在');
        return;
      }

      // 获取当前用户信息
      const operator = userInfo?.userName || 'unknown';

      // 转换日期为时间戳
      const formatDateToTimestamp = (date: any) => {
        if (!date) return undefined;
        return dayjs(date).valueOf().toString();
      };

      // 直接使用record的原始数据，只更新表单修改的字段
      const updateData: ApiBarcodeRecord & { operator: string } = {
        ...values,
        id: record.id,
        productionDateStart: formatDateToTimestamp(values.productionDateStart),
        productionDateEnd: formatDateToTimestamp(values.productionDateEnd),
        deliveryDate: formatDateToTimestamp(values.deliveryDate),
        operator: operator,
      };

      const response = await updateBarcodeRecord(updateData);
      
      if (response.success) {
        message.success('更新成功');
        onSuccess?.();
        onClose();
      } else {
        message.error(response.errorMsg || '更新失败');
      }
    } catch (error) {
      console.error('更新失败:', error);
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消按钮
  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="已分配编辑"
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={
        <Space>
          <Button onClick={handleCancel}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            确定
          </Button>
        </Space>
      }
      className="edit-record-modal"
    >
      <Form
        form={form}
        layout="vertical"
        className="edit-record-form"
      >
        {/* 第一行：产品编码、产品名称 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="产品编码"
              name="productCode"
              rules={[{ required: true, message: '请输入产品编码' }]}
            >
              <Input disabled className="disabled-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="产品名称"
              name="productName"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第二行：项目编码、单据编码 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="项目编码"
              name="projectCode"
              rules={[{ required: true, message: '请输入项目编码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="单据编码"
              name="orderCode"
              rules={[{ required: true, message: '请输入单据编码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第三行：供应商代码、柜号 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="供应商代码"
              name="supplierCode"
              rules={[{ required: true, message: '请输入供应商代码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="柜号"
              name="model"
            >
              <Input placeholder="本体model" />
            </Form.Item>
          </Col>
        </Row>

        {/* 第四行：客户物料编码、po行号 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="客户物料编码"
              name="materialCode"
              rules={[{ required: true, message: '请输入客户物料编码' }]}
            >
              <Input placeholder="PartNumber" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="po行号"
              name="pohh"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第五行：生产日期 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="生产日期">
              <Row gutter={8}>
                <Col span={11}>
                  <Form.Item
                    name="productionDateStart"
                    rules={[{ required: true, message: '请选择开始日期' }]}
                    style={{ margin: 0 }}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={2} style={{ textAlign: 'center', lineHeight: '32px' }}>
                  至
                </Col>
                <Col span={11}>
                  <Form.Item
                    name="productionDateEnd"
                    style={{ margin: 0 }}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          
        </Row>

        {/* 第六行：名称型号 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="名称型号"
              name="nameModel"
              rules={[{ required: true, message: '请输入名称型号' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第七行：数量、单位 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="数量"
              name="cnt"
              rules={[{ required: true, message: '请输入数量' }]}
            >
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="单位"
              name="unit"
              rules={[{ required: true, message: '请输入单位' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第八行：出厂码 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="出厂码"
              name="factoryCode"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第九行：SN码 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="SN码"
              name="codeSn"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第十行：09码 */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="09码"
              name="code09"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 第十一行：送货日期、图纸版本 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="送货日期"
              name="deliveryDate"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="图纸版本"
              name="drawingVersion"
              rules={[
                { len: 3, message: '图纸版本必须是3位字符' },
              ]}
            >
              <Input maxLength={3} placeholder="请输入3位字符" />
            </Form.Item>
          </Col>
        </Row>

        {/* 第十二行：附件 */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="附件">
              <Row gutter={8}>
                <Col span={16}>
                  <Form.Item
                    name="accessoryCnt"
                    style={{ margin: 0 }}
                  >
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8} style={{ lineHeight: '32px' }}>
                  个
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditRecordModal;