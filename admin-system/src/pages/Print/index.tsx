/**
 * 打印预览页面
 */
import { useState, useCallback } from 'react';
import { Button, Card, Select, Form, Input, InputNumber, Space, message, Divider } from 'antd';
import { PrinterOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { PrintTemplate } from '@/components/Print';
import {
  PrintTemplateType,
  PRINT_TEMPLATE_CONFIGS,
  type PrintContentData,
  type PrintConfig,
} from '@/types/print';
import {
  executePrint,
  cancelPrint,
  validatePrintConfig,
} from '@/services/print';
import './index.css';

const { Option } = Select;

export function PrintPage() {
  const [form] = Form.useForm();
  const [templateType, setTemplateType] = useState<PrintTemplateType>(PrintTemplateType.INNER_BARCODE);
  const [previewContent, setPreviewContent] = useState<PrintContentData | null>(null);
  const [loading, setLoading] = useState(false);

  // 处理模板类型变更
  const handleTemplateChange = useCallback((value: PrintTemplateType) => {
    setTemplateType(value);
    setPreviewContent(null);
  }, []);

  // 生成预览
  const handlePreview = useCallback(() => {
    form.validateFields().then(values => {
      const content: PrintContentData = {
        code: values.code,
        title: values.title,
        productName: values.productName,
        specification: values.specification,
        batchNo: values.batchNo,
        productionDate: values.productionDate,
        expiryDate: values.expiryDate,
        quantity: values.quantity,
        unit: values.unit,
        remark: values.remark,
      };
      setPreviewContent(content);
    }).catch(() => {
      message.error('请填写必填字段');
    });
  }, [form]);

  // 执行打印
  const handlePrint = useCallback(async () => {
    if (!previewContent) {
      message.warning('请先预览打印内容');
      return;
    }

    const config: PrintConfig = {
      templateType,
      content: previewContent,
      copies: form.getFieldValue('copies') || 1,
      showPreview: true,
    };

    const validation = validatePrintConfig(config);
    if (!validation.valid) {
      message.error(validation.errors.join('; '));
      return;
    }

    setLoading(true);
    try {
      await executePrint(config);
      message.success('打印成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '打印失败');
    } finally {
      setLoading(false);
    }
  }, [templateType, previewContent, form]);

  // 取消打印
  const handleCancel = useCallback(() => {
    if (previewContent) {
      const config: PrintConfig = {
        templateType,
        content: previewContent,
        copies: form.getFieldValue('copies') || 1,
      };
      cancelPrint(config);
      message.info('已取消打印');
    }
    setPreviewContent(null);
    form.resetFields();
  }, [templateType, previewContent, form]);

  // 获取当前模板配置
  const currentTemplateConfig = PRINT_TEMPLATE_CONFIGS[templateType];

  return (
    <div className="print-page">
      <div className="print-page-content">
        {/* 左侧表单 */}
        <Card title="打印设置" className="print-form-card">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              templateType: PrintTemplateType.INNER_BARCODE,
              copies: 1,
            }}
          >
            <Form.Item
              label="模板类型"
              name="templateType"
              rules={[{ required: true, message: '请选择模板类型' }]}
            >
              <Select onChange={handleTemplateChange}>
                {Object.values(PRINT_TEMPLATE_CONFIGS).map(config => (
                  <Option key={config.type} value={config.type}>
                    {config.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Divider>打印内容</Divider>

            <Form.Item
              label="条码/二维码内容"
              name="code"
              rules={[{ required: true, message: '请输入条码/二维码内容' }]}
            >
              <Input placeholder="请输入条码或二维码内容" />
            </Form.Item>

            <Form.Item label="标题" name="title">
              <Input placeholder="请输入标题（可选）" />
            </Form.Item>

            <Form.Item
              label="产品名称"
              name="productName"
              rules={[
                {
                  required: currentTemplateConfig.requiredFields.includes('productName'),
                  message: '请输入产品名称',
                },
              ]}
            >
              <Input placeholder="请输入产品名称" />
            </Form.Item>

            <Form.Item label="规格" name="specification">
              <Input placeholder="请输入规格（可选）" />
            </Form.Item>

            <Form.Item
              label="批次号"
              name="batchNo"
              rules={[
                {
                  required: currentTemplateConfig.requiredFields.includes('batchNo'),
                  message: '请输入批次号',
                },
              ]}
            >
              <Input placeholder="请输入批次号" />
            </Form.Item>

            <Form.Item label="生产日期" name="productionDate">
              <Input placeholder="请输入生产日期（可选）" />
            </Form.Item>

            <Form.Item label="有效期" name="expiryDate">
              <Input placeholder="请输入有效期（可选）" />
            </Form.Item>

            <Form.Item
              label="数量"
              name="quantity"
              rules={[
                {
                  required: currentTemplateConfig.requiredFields.includes('quantity'),
                  message: '请输入数量',
                },
              ]}
            >
              <InputNumber min={1} placeholder="请输入数量" style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item label="单位" name="unit">
              <Input placeholder="请输入单位（可选）" />
            </Form.Item>

            <Form.Item label="备注" name="remark">
              <Input.TextArea rows={2} placeholder="请输入备注（可选）" />
            </Form.Item>

            <Divider>打印设置</Divider>

            <Form.Item label="打印份数" name="copies">
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={handlePreview}
                >
                  预览
                </Button>
                <Button
                  type="primary"
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                  loading={loading}
                  disabled={!previewContent}
                >
                  打印
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleCancel}
                >
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 右侧预览 */}
        <Card title="打印预览" className="print-preview-card">
          <div className="print-preview-container">
            {previewContent ? (
              <PrintTemplate
                templateType={templateType}
                content={previewContent}
              />
            ) : (
              <div className="print-preview-placeholder">
                请填写打印内容并点击预览按钮
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default PrintPage;
