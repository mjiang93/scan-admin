/**
 * 登录功能使用示例
 */
import { login } from '@/services/auth';
import { testLogin, testLoginWithFetch } from '@/services/loginTest';
import type { LoginParams } from '@/types';

/**
 * 示例：使用登录功能
 */
export async function loginExample() {
  const loginParams: LoginParams = {
    userId: "string",  // 替换为实际的用户ID
    password: "string" // 替换为实际的密码
  };

  try {
    // 方式1：使用封装的登录服务
    console.log('=== 使用封装的登录服务 ===');
    const result = await login(loginParams);
    console.log('登录成功:', result);

    // 方式2：使用测试函数（axios）
    console.log('=== 使用axios测试 ===');
    const testResult = await testLogin(loginParams);
    console.log('测试登录成功:', testResult);

    // 方式3：使用原生fetch（与你提供的代码一致）
    console.log('=== 使用原生fetch测试 ===');
    const fetchResult = await testLoginWithFetch(loginParams);
    console.log('Fetch登录成功:', fetchResult);

  } catch (error) {
    console.error('登录失败:', error);
  }
}

/**
 * 在浏览器控制台中运行测试
 * 打开浏览器开发者工具，在控制台中输入：
 * 
 * import { loginExample } from './src/examples/loginExample';
 * loginExample();
 */