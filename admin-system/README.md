# 管理系统

基于 React 18 + TypeScript + Ant Design 5 的企业级PC管理系统。

## 技术栈

- **核心框架**: React 18 + TypeScript 5
- **UI组件库**: Ant Design 5
- **路由管理**: React Router 6
- **状态管理**: Zustand
- **HTTP客户端**: Axios
- **构建工具**: Vite 5
- **测试框架**: Vitest + fast-check
- **代码规范**: ESLint + Prettier

## 目录结构

```
src/
├── assets/              # 静态资源
│   ├── images/         # 图片
│   ├── icons/          # 图标
│   └── styles/         # 全局样式
├── components/          # 公共组件
├── layouts/            # 布局组件
├── pages/              # 页面组件
├── router/             # 路由配置
├── store/              # 状态管理
├── services/           # 业务服务
├── hooks/              # 自定义Hooks
├── utils/              # 工具函数
├── config/             # 配置文件
├── types/              # 类型定义
├── constants/          # 常量定义
└── tests/              # 测试文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建

```bash
# 测试环境
npm run build:test

# 生产环境
npm run build:prod
```

### 测试

```bash
# 运行测试
npm run test

# 测试UI
npm run test:ui

# 测试覆盖率
npm run test:coverage
```

### 代码规范

```bash
# 检查代码
npm run lint

# 格式化代码
npm run format
```

## 核心功能

- ✅ 用户认证与权限管理
- ✅ 动态路由系统
- ✅ 公共组件库
- ✅ HTTP请求封装
- ✅ 多环境配置
- ✅ 状态管理
- ✅ 打印功能
- ✅ 响应式布局

## 环境变量

在项目根目录创建环境变量文件：

- `.env.development` - 开发环境
- `.env.production` - 生产环境

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_TITLE=管理系统
VITE_APP_ENV=development
```

## License

MIT
