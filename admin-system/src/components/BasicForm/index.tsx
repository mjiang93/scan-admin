/**
 * 基础表单组件
 */
import { Form, Input, Select, DatePicker, InputNumber } from 'antd';
import type { FormProps, FormInstance } from 'antd';
import type { FormField } from '@/types';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

export interface BasicFormProps extends Omit<FormProps, 'children'> {
  // 表单字段配置
  fields: FormField[];
  // 表单实例
  form?: FormInstance;
}

export default function BasicForm({ fields, form, ...restProps }: BasicFormProps) {
  /**
   * 根据字段类型渲染表单控件
   */
  const renderFormItem = (field: FormField) => {
    switch (field.type) {
      case 'input':
        return <Input placeholder={field.placeholder} {...field} />;
      
      case 'textarea':
        return <TextArea placeholder={field.placeholder} rows={4} {...field} />;
      
      case 'number':
        return <InputNumber placeholder={field.placeholder} style={{ width: '100%' }} {...field} />;
      
      case 'select':
        return (
          <Select placeholder={field.placeholder} {...field}>
            {field.options?.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );
      
      case 'date':
        return <DatePicker placeholder={field.placeholder} style={{ width: '100%' }} {...field} />;
      
      case 'dateRange':
        return <RangePicker style={{ width: '100%' }} />;
      
      default:
        return <Input placeholder={field.placeholder} {...field} />;
    }
  };

  return (
    <Form form={form} layout="vertical" {...restProps}>
      {fields.map((field) => (
        <Form.Item
          key={field.name}
          name={field.name}
          label={field.label}
          rules={field.rules || (field.required ? [{ required: true, message: `请输入${field.label}` }] : [])}
        >
          {renderFormItem(field)}
        </Form.Item>
      ))}
    </Form>
  );
}
