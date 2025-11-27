# 设计文档

## 概述

本系统是一个基于React 18 + TypeScript + Ant Design 5的企业级PC管理系统。采用现代化的前端架构设计，提供完整的权限管理、动态路由、业务功能模块等核心能力。系统架构清晰，代码组织规范，支持多环境配置，易于维护和扩展。

### 技术栈

- **核心框架**: React 18 + TypeScript 5
- **UI组件库**: Ant Design 5
- **路由管理**: React Router 6
- **状态管理**: Zustand (轻量级状态管理)
- **HTTP客户端**: Axios
- **构建工具**: Vite 5
- **代码规范**: ESLint + Prettier
- **样式方案**: CSS Modules + Less

## 架构设计

### 整体架构

系统采用分层架构设计，从下到上分为：

```
┌─────────────────────────────────────────┐
│           展示层 (Presentation)          │
│  Pages / Components / Layouts           │
├─────────────────────────────────────────┤
│           业务层 (Business)              │
│  Hooks / Services / Utils               │
├─────────────────────────────────────────┤
│           数据层 (Data)                  │
│  API / Store / Models                   │
├─────────────────────────────────────────┤
│           基础层 (Infrastructure)        │
│  Request / Router / Config              │
└─────────────────────────────────────────┘
```

### 目录结构

```
src/
├── assets/              # 静态资源
│   ├── images/         # 图片
│   ├── icons/          # 图标
│   └── styles/         # 全局样式
├── components/          # 公共组件
│   ├── BasicTable/     # 基础表格组件
│   ├── BasicForm/      # 基础表单组件
│   ├── BasicModal/     # 基础弹窗组件
│   ├── SearchForm/     # 搜索表单组件
│   ├── Upload/         # 上传组件
│   └── AuthButton/     # 权限按钮组件
├── layouts/            # 布局组件
│   ├── BasicLayout/    # 基础布局
│   ├── BlankLayout/    # 空白布局
│   └── UserLayout/     # 用户布局(登录页)
├── pages/              # 页面组件
│   ├── Login/          # 登录页
│   ├── User/           # 用户管理
│   ├── Order/          # 订单管理
│   ├── Print/          # 打印页面
│   └── Exception/      # 异常页面(403/404/500)
├── router/             # 路由配置
│   ├── index.tsx       # 路由入口
│   ├── routes.tsx      # 路由配置
│   └── guard.tsx       # 路由守卫
├── store/              # 状态管理
│   ├── user.ts         # 用户状态
│   ├── permission.ts   # 权限状态
│   └── app.ts          # 应用状态
├── services/           # 业务服务
│   ├── user.ts         # 用户服务
│   ├── auth.ts         # 认证服务
│   └── order.ts        # 订单服务
├── hooks/              # 自定义Hooks
│   ├── useAuth.ts      # 认证Hook
│   ├── usePermission.ts # 权限Hook
│   └── useTable.ts     # 表格Hook
├── utils/              # 工具函数
│   ├── request.ts      # 请求封装
│   ├── format.ts       # 格式化工具
│   ├── validate.ts     # 验证工具
│   ├── storage.ts      # 存储工具
│   └── common.ts       # 通用工具
├── config/             # 配置文件
│   ├── index.ts        # 配置入口
│   └── env.ts          # 环境配置
├── types/              # 类型定义
│   ├── user.ts         # 用户类型
│   ├── api.ts          # API类型
│   └── common.ts       # 通用类型
├── constants/          # 常量定义
│   ├── index.ts        # 常量入口
│   └── enums.ts        # 枚举定义
├── App.tsx             # 应用入口
└── main.tsx            # 主入口
```

## 组件和接口

### 核心组件

#### 1. 路由守卫 (RouteGuard)

```typescript
interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredPermissions?: string[];
}
```

功能：
- 验证用户登录状态
- 检查路由访问权限
- 处理未授权访问

#### 2. 基础表格 (BasicTable)

```typescript
interface BasicTableProps<T> {
  columns: ColumnType<T>[];
  dataSource?: T[];
  loading?: boolean;
  pagination?: PaginationConfig;
  rowSelection?: RowSelectionConfig;
  onRefresh?: () => void;
  onExport?: () => void;
}
```

功能：
- 数据展示和分页
- 行选择和批量操作
- 刷新和导出功能

#### 3. 搜索表单 (SearchForm)

```typescript
interface SearchFormProps {
  fields: FormField[];
  onSearch: (values: any) => void;
  onReset?: () => void;
  loading?: boolean;
}
```

功能：
- 动态表单字段渲染
- 搜索和重置功能
- 表单验证

#### 4. 权限按钮 (AuthButton)

```typescript
interface AuthButtonProps extends ButtonProps {
  permission: string;
  children: React.ReactNode;
}
```

功能：
- 根据权限显示/隐藏按钮
- 继承Ant Design Button所有属性

### API接口设计

#### 认证接口

```typescript
// 登录
POST /api/auth/login
Request: { username: string; password: string }
Response: { token: string; userInfo: UserInfo }

// 登出
POST /api/auth/logout
Response: { success: boolean }

// 获取用户信息
GET /api/auth/userInfo
Response: { userInfo: UserInfo; permissions: string[] }
```

#### 用户管理接口

```typescript
// 获取用户列表
GET /api/users
Query: { page: number; pageSize: number; keyword?: string }
Response: { list: User[]; total: number }

// 创建用户
POST /api/users
Request: { username: string; password: string; roleId: string }
Response: { success: boolean; data: User }

// 更新用户
PUT /api/users/:id
Request: { username?: string; roleId?: string; status?: number }
Response: { success: boolean }

// 删除用户
DELETE /api/users/:id
Response: { success: boolean }
```

#### 订单管理接口

```typescript
// 获取订单列表
GET /api/orders
Query: { page: number; pageSize: number; status?: string }
Response: { list: Order[]; total: number }

// 获取订单详情
GET /api/orders/:id
Response: { data: OrderDetail }

// 导出订单
POST /api/orders/export
Request: { ids?: string[]; filters?: any }
Response: Blob (Excel文件)
```

## 数据模型

### 用户模型 (User)

```typescript
interface User {
  id: string;
  username: string;
  nickname: string;
  avatar?: string;
  email?: string;
  phone?: string;
  roleId: string;
  roleName: string;
  status: UserStatus; // 0-禁用 1-启用
  createTime: string;
  updateTime: string;
}

enum UserStatus {
  DISABLED = 0,
  ENABLED = 1
}
```

### 权限模型 (Permission)

```typescript
interface Permission {
  id: string;
  code: string;        // 权限编码，如 'user:add'
  name: string;        // 权限名称
  type: PermissionType; // page-页面权限 button-按钮权限
  parentId?: string;
}

enum PermissionType {
  PAGE = 'page',
  BUTTON = 'button'
}

interface Role {
  id: string;
  name: string;
  code: string;
  permissions: string[]; // 权限编码数组
}
```

### 路由模型 (Route)

```typescript
interface RouteConfig {
  path: string;
  name: string;
  component?: React.ComponentType;
  redirect?: string;
  meta?: RouteMeta;
  children?: RouteConfig[];
}

interface RouteMeta {
  title: string;
  icon?: string;
  permission?: string;  // 所需权限
  hideInMenu?: boolean; // 是否在菜单中隐藏
  keepAlive?: boolean;  // 是否缓存
}
```

### 订单模型 (Order)

```typescript
interface Order {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: OrderStatus;
  items: OrderItem[];
  createTime: string;
  updateTime: string;
}

enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1: 登录凭据验证一致性
*对于任意*用户凭据（用户名和密码），当调用登录验证函数时，应该返回一致的认证结果（成功或失败）
**验证需求: Requirements 1.1**

### 属性 2: Token存储完整性
*对于任意*成功的用户认证，系统应该生成有效的Token并正确存储到本地存储中，且存储的Token应该可以被读取和验证
**验证需求: Requirements 1.2**

### 属性 3: 认证失败错误处理
*对于任意*无效的用户凭据，系统应该显示错误提示信息且不进行页面跳转
**验证需求: Requirements 1.3**

### 属性 4: Token过期清理
*对于任意*过期的Token，当系统检测到Token过期时，应该清除本地存储并跳转到登录页面
**验证需求: Requirements 1.4**

### 属性 5: 登出状态清理
*对于任意*已登录用户，执行登出操作后，系统应该清除所有用户相关数据（Token、用户信息）并跳转到登录页面
**验证需求: Requirements 1.5**

### 属性 6: 权限加载一致性
*对于任意*用户角色，系统加载权限时应该返回与该角色关联的完整权限列表
**验证需求: Requirements 2.1**

### 属性 7: 页面权限验证
*对于任意*页面路由和用户权限组合，系统应该正确判断用户是否有权访问该页面
**验证需求: Requirements 2.2**

### 属性 8: 无权限跳转
*对于任意*用户没有访问权限的页面，系统应该拦截访问并跳转到403页面
**验证需求: Requirements 2.3**

### 属性 9: 按钮权限控制
*对于任意*按钮权限配置，系统应该根据用户权限正确显示或隐藏按钮
**验证需求: Requirements 2.4**

### 属性 10: 权限更新同步
*对于任意*用户权限修改操作，系统应该更新权限数据并触发重新登录流程
**验证需求: Requirements 2.5**

### 属性 11: 动态路由生成
*对于任意*用户权限集合，系统应该生成包含所有有权访问路由的路由配置
**验证需求: Requirements 3.1**

### 属性 12: 路由数据完整性
*对于任意*生成的路由配置，每个路由对象应该包含path、component、meta等必需字段
**验证需求: Requirements 3.2**

### 属性 13: 未授权路由拦截
*对于任意*用户未授权的路由访问，系统应该拦截并跳转到403页面
**验证需求: Requirements 3.3**

### 属性 14: 路由菜单同步
*对于任意*路由配置，系统生成的菜单结构应该与路由配置保持一致
**验证需求: Requirements 3.4**

### 属性 15: 用户列表数据完整性
*对于任意*用户列表渲染，每个用户项应该包含用户名、角色、状态等必需字段
**验证需求: Requirements 4.1**

### 属性 16: 表单必填验证
*对于任意*用户编辑表单，提交时应该验证所有必填字段是否已填写
**验证需求: Requirements 4.2**

### 属性 17: 数据格式验证
*对于任意*用户提交的数据，系统应该验证数据格式的正确性（如邮箱格式、手机号格式）
**验证需求: Requirements 4.3**

### 属性 18: 用户编辑数据加载
*对于任意*用户编辑操作，系统应该正确加载该用户的完整信息
**验证需求: Requirements 4.4**

### 属性 19: 删除确认流程
*对于任意*用户删除操作，系统应该先显示确认对话框，只有在确认后才执行删除
**验证需求: Requirements 4.5**

### 属性 20: 分页功能
*对于任意*超过分页大小的数据列表，系统应该提供分页控件并正确分页显示
**验证需求: Requirements 4.6**

### 属性 21: 搜索过滤
*对于任意*搜索条件，系统应该返回符合条件的过滤结果
**验证需求: Requirements 4.7**

### 属性 22: 订单列表数据完整性
*对于任意*订单列表渲染，每个订单项应该包含订单号、状态、金额等必需字段
**验证需求: Requirements 5.1**

### 属性 23: 订单详情完整性
*对于任意*订单详情查询，返回的数据应该包含订单的所有详细信息
**验证需求: Requirements 5.2**

### 属性 24: 订单状态筛选
*对于任意*订单状态筛选条件，系统应该返回该状态的所有订单
**验证需求: Requirements 5.3**

### 属性 25: 订单导出数据一致性
*对于任意*订单导出操作，导出的Excel文件应该包含所选订单的完整数据
**验证需求: Requirements 5.4**

### 属性 26: 批量操作选择
*对于任意*批量操作，系统应该正确处理所有选中的订单
**验证需求: Requirements 5.5**

### 属性 27: 打印内容完整性
*对于任意*打印内容生成，应该包含条码、二维码等所有必需元素
**验证需求: Requirements 6.2**

### 属性 28: 打印模板匹配
*对于任意*单据类型，系统应该使用对应的打印模板进行渲染
**验证需求: Requirements 6.4**

### 属性 29: 打印日志记录
*对于任意*打印操作，系统应该记录打印日志包含时间、用户、单据类型等信息
**验证需求: Requirements 6.5**

### 属性 30: 请求Token注入
*对于任意*HTTP请求，系统应该自动在请求头中添加当前用户的Token
**验证需求: Requirements 7.1**

### 属性 31: 401状态处理
*对于任意*返回401状态码的请求，系统应该自动跳转到登录页面
**验证需求: Requirements 7.2**

### 属性 32: 错误统一处理
*对于任意*请求错误，系统应该统一处理并显示用户友好的错误提示
**验证需求: Requirements 7.3**

### 属性 33: 拦截器执行
*对于任意*HTTP请求，系统应该按顺序执行请求拦截器和响应拦截器
**验证需求: Requirements 7.4**

### 属性 34: 超时处理
*对于任意*超时的请求，系统应该显示超时提示并提供重试选项
**验证需求: Requirements 7.5**

### 属性 35: 重复请求取消
*对于任意*重复的HTTP请求，系统应该取消之前未完成的相同请求
**验证需求: Requirements 7.6**

### 属性 36: 环境配置加载
*对于任意*环境变量，系统应该加载对应环境的配置文件
**验证需求: Requirements 8.1**

### 属性 37: 环境API地址切换
*对于任意*环境切换，系统应该使用对应环境的API基础地址
**验证需求: Requirements 8.2**

### 属性 38: 配置访问接口
*对于任意*配置项访问，系统应该提供统一的配置获取方法
**验证需求: Requirements 8.4**

### 属性 39: 默认配置降级
*对于任意*缺失的配置项，系统应该使用预定义的默认值
**验证需求: Requirements 8.5**

### 属性 40: 表格组件功能完整性
*对于任意*表格组件实例，应该提供分页、排序、筛选等基础功能
**验证需求: Requirements 9.1**

### 属性 41: 表单验证功能
*对于任意*表单组件实例，应该提供字段验证和数据双向绑定功能
**验证需求: Requirements 9.2**

### 属性 42: 弹窗自定义能力
*对于任意*弹窗组件实例，应该支持自定义内容和回调函数
**验证需求: Requirements 9.3**

### 属性 43: 搜索条件组合
*对于任意*搜索组件实例，应该支持多个搜索条件的组合查询
**验证需求: Requirements 9.4**

### 属性 44: 上传文件验证
*对于任意*上传组件实例，应该验证文件类型和大小，并显示上传进度
**验证需求: Requirements 9.5**

### 属性 45: 组件参数验证
*对于任意*组件参数，系统应该验证参数类型并在缺失时使用默认值
**验证需求: Requirements 9.6**

### 属性 46: 日期格式化一致性
*对于任意*日期值和格式模板，格式化函数应该返回符合模板的日期字符串
**验证需求: Requirements 10.1**

### 属性 47: 数字格式化正确性
*对于任意*数字值，格式化函数应该正确添加千分位、保留小数位等
**验证需求: Requirements 10.2**

### 属性 48: 数据验证准确性
*对于任意*输入数据，验证函数应该准确判断手机号、邮箱、身份证等格式的有效性
**验证需求: Requirements 10.3**

### 属性 49: 数组操作正确性
*对于任意*数组，去重、扁平化等操作应该返回正确的结果
**验证需求: Requirements 10.4**

### 属性 50: 对象深拷贝独立性
*对于任意*对象，深拷贝后的对象应该与原对象完全独立，修改不互相影响
**验证需求: Requirements 10.5**

### 属性 51: 字符串处理正确性
*对于任意*字符串，截取、脱敏等操作应该返回正确的结果
**验证需求: Requirements 10.6**

### 属性 52: 用户状态存储
*对于任意*用户登录操作，用户信息应该正确存储到全局状态中
**验证需求: Requirements 11.1**

### 属性 53: 状态访问接口
*对于任意*全局状态访问，应该通过统一的接口获取状态值
**验证需求: Requirements 11.2**

### 属性 54: 状态更新通知
*对于任意*全局状态更新，所有订阅该状态的组件应该收到更新通知
**验证需求: Requirements 11.3**

### 属性 55: 状态持久化恢复
*对于任意*页面刷新，系统应该从本地存储恢复必要的全局状态
**验证需求: Requirements 11.4**

### 属性 56: 状态中间件执行
*对于任意*状态变更，系统应该按顺序执行所有注册的中间件
**验证需求: Requirements 11.5**

### 属性 57: 响应式菜单收起
*对于任意*屏幕宽度小于768px的情况，侧边菜单应该自动收起
**验证需求: Requirements 12.1**

### 属性 58: 布局自适应
*对于任意*浏览器窗口大小变化，布局应该自动调整以适应新尺寸
**验证需求: Requirements 12.2**

### 属性 59: 移动端界面适配
*对于任意*移动设备访问，系统应该显示移动端优化的界面布局
**验证需求: Requirements 12.3**

### 属性 60: 表格横向滚动
*对于任意*列数超出容器宽度的表格，应该提供横向滚动功能
**验证需求: Requirements 12.4**

### 属性 61: 内容溢出处理
*对于任意*内容超出容器的情况，系统应该提供滚动条或自适应处理
**验证需求: Requirements 12.5**

## 错误处理

### 错误分类

系统将错误分为以下几类：

1. **网络错误**: 请求超时、网络断开等
2. **业务错误**: 后端返回的业务逻辑错误
3. **权限错误**: 401未授权、403无权限
4. **系统错误**: 500服务器错误、前端运行时错误

### 错误处理策略

#### 全局错误处理

```typescript
// 请求错误拦截
axios.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    if (!response) {
      // 网络错误
      message.error('网络连接失败，请检查网络');
      return Promise.reject(error);
    }
    
    switch (response.status) {
      case 401:
        // 未授权，跳转登录
        clearAuth();
        navigate('/login');
        break;
      case 403:
        // 无权限
        message.error('您没有权限执行此操作');
        break;
      case 500:
        // 服务器错误
        message.error('服务器错误，请稍后重试');
        break;
      default:
        // 其他错误
        message.error(response.data?.message || '请求失败');
    }
    
    return Promise.reject(error);
  }
);
```

#### 组件级错误边界

```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误日志
    console.error('Component Error:', error, errorInfo);
    
    // 显示错误提示
    message.error('页面出现错误，请刷新重试');
  }
  
  render() {
    return this.props.children;
  }
}
```

### 错误日志

系统应该记录以下错误信息：

- 错误类型和消息
- 错误堆栈
- 用户信息
- 操作上下文
- 时间戳

## 测试策略

### 单元测试

使用Vitest作为测试框架，对以下模块进行单元测试：

1. **工具函数**: 格式化、验证、数组/对象操作等
2. **业务逻辑**: 权限判断、路由生成、数据处理等
3. **Hooks**: 自定义Hooks的逻辑测试
4. **组件**: 公共组件的功能测试

测试覆盖率目标：核心业务逻辑 > 80%

### 属性测试

使用fast-check作为属性测试库，对核心逻辑进行属性测试：

1. **权限系统**: 权限判断、路由生成的正确性
2. **数据处理**: 格式化、验证函数的通用性
3. **状态管理**: 状态更新和持久化的一致性
4. **HTTP封装**: 请求拦截、错误处理的可靠性

每个属性测试应该运行至少100次迭代，确保在各种输入下都能正确工作。

### 集成测试

使用React Testing Library进行组件集成测试：

1. **页面流程**: 登录流程、用户管理流程、订单管理流程
2. **权限控制**: 不同权限用户的页面访问和按钮显示
3. **表单交互**: 表单填写、验证、提交流程

### 端到端测试

使用Playwright进行关键业务流程的端到端测试：

1. 用户登录到退出的完整流程
2. 用户管理的增删改查流程
3. 订单管理和打印流程

### 测试配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
    },
  },
});
```

### 属性测试标注规范

每个属性测试必须使用注释标注对应的设计文档属性：

```typescript
// **Feature: admin-management-system, Property 1: 登录凭据验证一致性**
test('login credential validation consistency', () => {
  fc.assert(
    fc.property(
      fc.record({
        username: fc.string(),
        password: fc.string(),
      }),
      (credentials) => {
        const result1 = validateLogin(credentials);
        const result2 = validateLogin(credentials);
        expect(result1).toEqual(result2);
      }
    ),
    { numRuns: 100 }
  );
});
```

## 性能优化

### 代码分割

使用React.lazy和Suspense进行路由级别的代码分割：

```typescript
const UserManage = lazy(() => import('@/pages/User'));
const OrderManage = lazy(() => import('@/pages/Order'));
```

### 组件优化

1. 使用React.memo避免不必要的重渲染
2. 使用useMemo和useCallback缓存计算结果和函数
3. 虚拟滚动处理大数据列表

### 请求优化

1. 请求去重：取消重复的pending请求
2. 请求缓存：缓存GET请求结果
3. 请求合并：合并短时间内的多个请求

### 构建优化

1. 使用Vite的快速HMR
2. 生产环境代码压缩和Tree Shaking
3. 静态资源CDN加速

## 安全考虑

### 认证安全

1. Token存储使用httpOnly cookie或加密的localStorage
2. Token定期刷新机制
3. 敏感操作二次验证

### XSS防护

1. 使用React的自动转义
2. 危险的innerHTML使用DOMPurify清理
3. CSP策略配置

### CSRF防护

1. 请求携带CSRF Token
2. 验证Referer头
3. 使用SameSite Cookie属性

### 数据安全

1. 敏感数据脱敏显示
2. 前端不存储敏感信息
3. HTTPS传输加密

## 部署方案

### 构建流程

```bash
# 安装依赖
npm install

# 开发环境
npm run dev

# 构建测试环境
npm run build:test

# 构建生产环境
npm run build:prod
```

### 环境配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=管理系统-开发环境

// .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=管理系统
```

### Nginx配置

```nginx
server {
  listen 80;
  server_name example.com;
  
  root /usr/share/nginx/html;
  index index.html;
  
  # SPA路由支持
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # API代理
  location /api {
    proxy_pass http://backend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # 静态资源缓存
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## 维护和扩展

### 代码规范

1. 使用ESLint和Prettier保证代码风格一致
2. 使用TypeScript提供类型安全
3. 组件和函数添加JSDoc注释
4. Git提交遵循Conventional Commits规范

### 文档维护

1. README.md：项目介绍和快速开始
2. CHANGELOG.md：版本更新日志
3. 组件文档：Storybook展示组件用法

### 扩展指南

#### 添加新页面

1. 在pages目录创建页面组件
2. 在router/routes.tsx添加路由配置
3. 在权限配置中添加页面权限
4. 更新菜单配置

#### 添加新组件

1. 在components目录创建组件
2. 编写组件类型定义
3. 添加组件测试
4. 更新组件文档

#### 添加新API

1. 在services目录添加服务函数
2. 定义API类型
3. 添加错误处理
4. 编写单元测试
