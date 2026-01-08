import { useState } from 'react';
import { Form, Input, Button, Card, App } from 'antd';
import { UserOutlined, LockOutlined, ScanOutlined } from '@ant-design/icons';
import { login } from '@/services/auth';
import type { LoginParams } from '@/types';
import ParticleBackground from '@/components/ParticleBackground';
import './index.css';

export default function Login() {
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
      <ParticleBackground />
      <div className="login-card-wrapper">
        <div className="login-header">
          <div className="barcode-icon">
            <ScanOutlined />
          </div>
          <h1 className="system-title">扫码管理系统</h1>
          <p className="system-subtitle">Barcode Management System</p>
        </div>
        <Card className="login-card">
          <Form 
            form={form} 
            onFinish={handleSubmit}
            initialValues={{ userId: 'capo001', password: '123456' }}
          >
            <Form.Item
              name="userId"
              rules={[{ required: true, message: '请输入用户ID' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入用户ID"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                {loading ? '登录中...' : '登录系统'}
              </Button>
            </Form.Item>
          </Form>
          <div className="barcode-decoration">
            <div className="barcode-lines">
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
