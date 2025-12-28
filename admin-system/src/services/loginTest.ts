/**
 * 登录接口测试
 * 用于验证登录接口对接是否正确
 */
import { post } from '@/utils/request';
import type { LoginParams, LoginResult } from '@/types';

/**
 * 测试登录接口
 */
export async function testLogin(params: LoginParams): Promise<LoginResult> {
  try {
    console.log('发送登录请求:', params);
    console.log('请求地址:', `${import.meta.env.VITE_API_BASE_URL}user/login`);
    
    const result = await post<LoginResult>('/user/login', params);
    console.log('登录响应:', result);
    
    // 检查响应格式
    if (result.success && result.code === 0 && result.data) {
      console.log('登录成功，token:', result.data.token);
      console.log('用户信息:', {
        userId: result.data.userId,
        userName: result.data.userName,
        status: result.data.status
      });
    } else {
      console.log('登录失败:', result.errorMsg || result.msg);
    }
    
    return result;
  } catch (error) {
    console.error('登录失败:', error);
    throw error;
  }
}

/**
 * 使用原生fetch测试（与你提供的代码一致）
 */
export async function testLoginWithFetch(params: LoginParams): Promise<LoginResult> {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}user/login`, {
      headers: {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "content-type": "application/json"
      },
      body: JSON.stringify(params),
      method: "POST",
      mode: "cors",
      credentials: "omit"
    });
    
    const result: LoginResult = await response.json();
    console.log('Fetch登录响应:', result);
    
    // 检查响应格式
    if (result.success && result.code === 0 && result.data) {
      console.log('Fetch登录成功，token:', result.data.token);
      console.log('Fetch用户信息:', {
        userId: result.data.userId,
        userName: result.data.userName,
        status: result.data.status
      });
    } else {
      console.log('Fetch登录失败:', result.errorMsg || result.msg);
    }
    
    return result;
  } catch (error) {
    console.error('Fetch登录失败:', error);
    throw error;
  }
}