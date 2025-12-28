# 登录流程说明

## 修改内容

根据要求，已经优化了登录接口的调用逻辑：

### 1. 登录接口调用优化
- **单次调用**：登录接口只调用一次，不进行重复调用
- **成功判断**：只有当 `code === 0` 时才算登录成功
- **错误处理**：其他情况都由统一的接口封装处理，自动显示错误信息

### 2. 登录成功处理
- 登录成功后直接跳转到条码打印页面 (`/print`)
- 保存用户信息和 token 到本地存储
- 显示登录成功提示信息

### 3. 错误处理机制
- 统一在 `request.ts` 中处理所有 API 错误
- 自动显示错误信息，无需在业务代码中重复处理
- 网络错误、服务器错误等都有相应的提示

## API 响应格式

系统期望的登录成功响应格式：

```json
{
  "code": 0,
  "data": {
    "status": 0,
    "token": "eyJ0aW1lc3RhbXAiOjE3Njc0OTQ2ODkyOTQsInVzZXJJZCI6ImNhcG8wMDEifQ==",
    "userId": "capo001",
    "userName": "capo001"
  },
  "errorMsg": "操作成功",
  "msg": "操作成功",
  "success": true
}
```

## 登录流程

1. 用户输入用户名和密码
2. 点击登录按钮
3. 调用 `/user/login` 接口（只调用一次）
4. 判断响应中的 `code` 字段：
   - `code === 0`：登录成功，保存用户信息，跳转到打印页面
   - `code !== 0`：登录失败，统一错误处理显示失败信息

## 测试账号

默认测试账号：
- 用户ID：`capo001`
- 密码：`123456`

## 技术实现

### 登录服务 (`services/auth.ts`)
```typescript
export async function login(params: LoginParams): Promise<LoginResult> {
  // 只调用一次接口
  const result = await post<LoginResult>('/user/login', params);
  
  // 只有当 code === 0 时才算成功
  if (result.code === 0 && result.data) {
    // 保存用户信息和 token
    // ...
  }
  
  return result;
}
```

### 登录页面 (`pages/Login/index.tsx`)
```typescript
const handleSubmit = async (values: LoginParams) => {
  try {
    const result = await login(values);
    
    // 只检查 code === 0
    if (result.code === 0) {
      message.success('登录成功');
      navigate('/print', { replace: true });
    }
  } catch (error) {
    // 错误已经由统一接口处理，无需额外处理
  }
};
```

### 统一错误处理 (`utils/request.ts`)
```typescript
// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 只有当 code === 0 时才算成功
    if (data.code === 0) {
      return data;
    }
    
    // 其他情况统一处理错误
    const errorMessage = data.errorMsg || data.msg || '请求失败';
    message.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);
```

## 优势

1. **简化业务逻辑**：业务代码只需关注成功情况，错误处理统一管理
2. **避免重复调用**：确保接口只调用一次，提高性能
3. **统一错误提示**：所有错误信息都由统一的拦截器处理
4. **清晰的成功判断**：只有 `code === 0` 才算成功，逻辑清晰