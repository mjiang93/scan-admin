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

  // 当弹窗打开时，填充表单数据
  useEffect(() => {
    if (visible && record) {
      // 将BarcodeRecord转换为表单数据
      const formData = {
        projectCode: record.projectCode,
        productionDateStart: record.createTime ? dayjs(record.createTime) : null,
        productionDateEnd: record.createTime ? dayjs(record.createTime) : null,
        lineName: record.productionLine,
        technicalVersion: record.techVersion,
        nameModel: record.remark || '',
        cnt: 100, // 默认数量
        unit: 'PCS',
        supplierCode: record.supplierCode,
        factoryCode: record.factoryCode,
        codeSn: record.snCode,
        code09: record.code09,
        materialCode: record.circuitBoardCode,
        deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
        accessoryCnt: parseInt(record.accessories?.replace('件', '') || '0'),
        drawingVersion: 'A001', // 默认图纸版本
      };
      
      form.setFieldsValue(formData);
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
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const operator = userInfo.username || 'admin';

      // 构造API需要的数据格式
      const updateData: ApiBarcodeRecord & { operator: string } = {
        id: record.id,
        projectCode: values.projectCode,
        productionDateStart: values.productionDateStart?.format('YYYY-MM-DD') || '',
        productionDateEnd: values.productionDateEnd?.format('YYYY-MM-DD') || '',
        lineName: values.lineName,
        technicalVersion: values.technicalVersion,
        nameModel: values.nameModel,
        cnt: values.cnt,
        unit: values.unit,
        supplierCode: values.supplierCode,
        factoryCode: values.factoryCode,
        codeSn: values.codeSn,
        code09: values.code09,
        materialCode: values.materialCode,
        deliveryDate: values.deliveryDate?.format('YYYY-MM-DD') || '',
        accessoryCnt: values.accessoryCnt || 0,
        drawingVersion: values.drawingVersion,
        // 保持原有的其他字段
        btPrintCnt: 0,
        nbzPrintCnt: 0,
        wbzPrintCnt: 0,
        printStatus: 0,
        createTime: record.createTime,
        creator: operator,
        modifier: operator,
        modifiyTime: null,
        operator: operator, // 添加操作人字段
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
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="项目编码"
              name="projectCode"
              rules={[{ required: true, message: '请输入项目编码' }]}
            >
              <Input disabled className="disabled-input" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="生产日期" required>
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
                    rules={[{ required: true, message: '请选择结束日期' }]}
                    style={{ margin: 0 }}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="生产线"
              name="lineName"
              rules={[{ required: true, message: '请输入生产线' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="技术版本"
              name="technicalVersion"
              rules={[{ required: true, message: '请输入技术版本' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="供货商代码"
              name="supplierCode"
              rules={[{ required: true, message: '请输入供货商代码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="出厂码"
              name="factoryCode"
              rules={[{ required: true, message: '请输入出厂码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="SN码"
              name="codeSn"
              rules={[{ required: true, message: '请输入SN码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="09码"
              name="code09"
              rules={[{ required: true, message: '请输入09码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="物料编码"
              name="materialCode"
              rules={[{ required: true, message: '请输入物料编码' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="送货日期"
              name="deliveryDate"
              rules={[{ required: true, message: '请选择送货日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="图纸版本"
              name="drawingVersion"
              rules={[{ required: true, message: '请输入图纸版本' }]}
            >
              <Input />
            </Form.Item>
          </Col>
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