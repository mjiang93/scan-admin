/**
 * 登录测试页面
 * 用于测试登录功能和token缓存
 */
import React, { useState } from 'react';
import { Button, Form, Input, Card, Space, Typography, Divider } from 'antd';
import { login, getCachedToken, getCachedUserInfo } from '@/services/auth';
import { testLogin, testLoginWithFetch } from '@/services/loginTest';
import type { LoginParams } from '@/types';

const { Title, Text, Paragraph } = Typography;

export default function LoginTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cachedInfo, setCachedInfo] = useState<any>(null);

  const handleLogin = async (values: LoginParams) => {
    setLoading(true);
    try {
      const response = await login(values);
      setResult(response);
      
      // 获取缓存信息
      const token = getCachedToken();
      const userInfo = getCachedUserInfo();
      setCachedInfo({ token, userInfo });
      
      console.log('登录成功:', response);
    } catch (error) {
      console.error('登录失败:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (values: LoginParams) => {
    setLoading(true);
    try {
      const response = await testLogin(values);
      setResult(response);
    } catch (error) {
      console.error('测试登录失败:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLogin = async (values: LoginParams) => {
    setLoading(true);
    try {
      const response = await testLoginWithFetch(values);
      setResult(response);
    } catch (error) {
      console.error('Fetch登录失败:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCachedData = () => {
    const token = getCachedToken();
    const userInfo = getCachedUserInfo();
    const loginData = localStorage.getItem('loginData');
    
    setCachedInfo({
      token,
      userInfo,
      loginData: loginData ? JSON.parse(loginData) : null
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>登录功能测试</Title>
      
      <Card title="登录表单" style={{ marginBottom: '24px' }}>
        <Form
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ userId: 'capo', password: '123456' }}
        >
          <Form.Item
            label="用户ID"
            name="userId"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="请输入用户ID" />
          </Form.Item>
          
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                正式登录
              </Button>
              <Button onClick={(e) => {
                const form = e.currentTarget.closest('form');
                const formData = new FormData(form!);
                const values = {
                  userId: formData.get('userId') as string,
                  password: formData.get('password') as string
                };
                handleTestLogin(values);
              }}>
                测试登录
              </Button>
              <Button onClick={(e) => {
                const form = e.currentTarget.closest('form');
                const formData = new FormData(form!);
                const values = {
                  userId: formData.get('userId') as string,
                  password: formData.get('password') as string
                };
                handleFetchLogin(values);
              }}>
                Fetch登录
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="缓存数据检查" style={{ marginBottom: '24px' }}>
        <Button onClick={checkCachedData} style={{ marginBottom: '16px' }}>
          检查缓存数据
        </Button>
        
        {cachedInfo && (
          <div>
            <Title level={4}>缓存信息:</Title>
            <Paragraph>
              <Text strong>Token:</Text> {cachedInfo.token || '无'}
            </Paragraph>
            <Paragraph>
              <Text strong>用户信息:</Text> {JSON.stringify(cachedInfo.userInfo, null, 2)}
            </Paragraph>
            <Paragraph>
              <Text strong>登录数据:</Text> {JSON.stringify(cachedInfo.loginData, null, 2)}
            </Paragraph>
          </div>
        )}
      </Card>

      {result && (
        <Card title="响应结果">
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '16px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}