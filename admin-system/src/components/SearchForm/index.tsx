/**
 * 搜索表单组件
 * 支持多种表单控件（输入框、选择器、日期选择器）
 * 实现搜索和重置功能
 * 支持条件组合
 */
import { Form, Row, Col, Button, Space, Input, Select, DatePicker, InputNumber } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd';
import type { FormField } from '@/types';

const { RangePicker } = DatePicker;

export interface SearchFormProps {
  // 搜索字段配置
  fields: FormField[];
  // 搜索回调
  onSearch: (values: Record<string, any>) => void;
  // 重置回调
  onReset?: () => void;
  // 加载状态
  loading?: boolean;
  // 表单实例
  form?: FormInstance;
  // 每行显示的字段数量
  columns?: number;
}

/**
 * 根据字段类型渲染表单控件
 */
export function renderSearchField(field: FormField): React.ReactNode {
  const { type, placeholder, options, ...restProps } = field;
  
  switch (type) {
    case 'input':
      return <Input placeholder={placeholder || `请输入${field.label}`} allowClear {...restProps} />;
    
    case 'select':
      return (
        <Select 
          placeholder={placeholder || `请选择${field.label}`} 
          allowClear
          style={{ width: '100%' }}
          {...restProps}
        >
          {options?.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      );
    
    case 'date':
      return (
        <DatePicker 
          placeholder={placeholder || `请选择${field.label}`} 
          style={{ width: '100%' }} 
          {...restProps} 
        />
      );
    
    case 'dateRange':
      return <RangePicker style={{ width: '100%' }} {...restProps} />;
    
    case 'number':
      return (
        <InputNumber 
          placeholder={placeholder || `请输入${field.label}`} 
          style={{ width: '100%' }} 
          {...restProps} 
        />
      );
    
    default:
      return <Input placeholder={placeholder || `请输入${field.label}`} allowClear {...restProps} />;
  }
}

/**
 * 组合搜索条件，过滤掉空值
 */
export function combineSearchConditions(values: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(values)) {
    // 过滤掉 undefined、null、空字符串
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * 验证搜索条件是否有效
 */
export function validateSearchConditions(
  values: Record<string, any>,
  fields: FormField[]
): boolean {
  // 检查所有值是否与字段配置匹配
  for (const [key, value] of Object.entries(values)) {
    const field = fields.find(f => f.name === key);
    if (!field) {
      // 值对应的字段不存在
      continue;
    }
    
    // 验证值类型与字段类型匹配
    if (value !== undefined && value !== null && value !== '') {
      switch (field.type) {
        case 'number':
          if (typeof value !== 'number' && isNaN(Number(value))) {
            return false;
          }
          break;
        case 'select':
          // 选择器的值应该在选项中
          if (field.options && !field.options.some(opt => opt.value === value)) {
            return false;
          }
          break;
      }
    }
  }
  
  return true;
}

export default function SearchForm({
  fields,
  onSearch,
  onReset,
  loading = false,
  form: externalForm,
  columns = 4,
}: SearchFormProps) {
  const [form] = Form.useForm(externalForm);

  const handleSearch = () => {
    form.validateFields().then((values) => {
      // 组合搜索条件，过滤空值
      const combinedValues = combineSearchConditions(values);
      onSearch(combinedValues);
    });
  };

  const handleReset = () => {
    form.resetFields();
    if (onReset) {
      onReset();
    } else {
      onSearch({});
    }
  };

  // 计算每个字段的列宽
  const colSpan = Math.floor(24 / columns);

  return (
    <div className="search-form" style={{ marginBottom: 16, padding: 16, background: '#fafafa' }}>
      <Form form={form} layout="inline">
        <Row gutter={16} style={{ width: '100%' }}>
          {fields.map((field) => (
            <Col key={field.name} span={colSpan}>
              <Form.Item
                name={field.name}
                label={field.label}
                rules={field.rules}
                style={{ marginBottom: 16, width: '100%' }}
              >
                {renderSearchField(field)}
              </Form.Item>
            </Col>
          ))}
          <Col>
            <Form.Item style={{ marginBottom: 16 }}>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  loading={loading}
                >
                  搜索
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
