/**
 * 登录页面
 */
import { useState } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';
import type { LoginParams } from '@/types';
import './index.css';

export default function Login() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  
  const handleSubmit = async (values: LoginParams) => {
    setLoading(true);
    try {
      const result = await login(values);
      
      // 只有 code === 0 时才算成功
      if (result.code === 0) {
        message.success('登录成功');
        
        // 登录成功后使用 replace 方式跳转到打印页面
        setTimeout(() => {
          window.location.replace('#/print');
        }, 500);
      }
    } catch (error) {
      // 错误已经由统一的接口封装处理，这里不需要额外处理
      console.error('登录错误:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="login-container">
      <Card title="用户登录" style={{ width: 400 }}>
        <Form 
          form={form} 
          onFinish={handleSubmit}
          initialValues={{ userId: 'capo001', password: '123456' }}
        >
          <Form.Item
            name="userId"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户ID" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
