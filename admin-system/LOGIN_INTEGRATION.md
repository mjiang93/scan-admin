# 登录接口对接说明

## 概述

已成功对接登录接口 `http://47.110.53.133:7077/user/login`，支持以下参数格式：

```json
{
  "userId": "string",
  "password": "string"
}
```

## 更新内容

### 1. 类型定义更新 (`src/types/user.ts`)
- 将 `LoginParams` 中的 `username` 字段改为 `userId`
- 更新 `LoginResult` 类型以支持不同的响应格式

### 2. 认证服务更新 (`src/services/auth.ts`)
- 更新登录接口地址为 `/user/login`
- 增强响应处理逻辑，支持多种响应格式

### 3. 登录页面更新 (`src/pages/Login/index.tsx`)
- 表单字段从 `username` 改为 `userId`
- 更新占位符文本为"用户ID"

### 4. 环境配置
- API基础地址已配置为 `http://47.110.53.133:7077/`
- 支持开发环境和生产环境配置

## 使用方法

### 在组件中使用

```typescript
import { login } from '@/services/auth';
import type { LoginParams } from '@/types';

const handleLogin = async () => {
  const params: LoginParams = {
    userId: "your_user_id",
    password: "your_password"
  };
  
  try {
    const result = await login(params);
    console.log('登录成功:', result);
  } catch (error) {
    console.error('登录失败:', error);
  }
};
```

### 直接使用fetch（与你提供的代码一致）

```typescript
const response = await fetch("http://47.110.53.133:7077/user/login", {
  headers: {
    "accept": "*/*",
    "accept-language": "zh-CN,zh;q=0.9",
    "content-type": "application/json"
  },
  body: JSON.stringify({
    "password": "string",
    "userId": "string"
  }),
  method: "POST",
  mode: "cors",
  credentials: "omit"
});
```

## 测试

项目中包含了测试文件：
- `src/services/loginTest.ts` - 登录接口测试函数
- `src/examples/loginExample.ts` - 使用示例

## 注意事项

1. 确保替换示例中的 `"string"` 为实际的用户ID和密码
2. 登录成功后，token会自动保存到localStorage
3. 用户信息和权限会自动更新到全局状态管理
4. 接口支持CORS跨域请求
5. 请求超时时间设置为30秒，支持3次重试

## 错误处理

登录失败时会显示具体的错误信息：
- 401: 登录已过期，请重新登录
- 403: 您没有权限执行此操作
- 404: 请求的资源不存在
- 500: 服务器错误，请稍后重试
- 网络错误: 网络连接失败，请检查网络