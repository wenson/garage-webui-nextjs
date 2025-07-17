# Garage Web UI Next.js 项目架构

## 项目概述

本项目是 Garage Object Storage Service 的 Next.js 14 管理界面，采用现代化的 React 技术栈和最佳实践。

## 技术栈

### 核心框架

- **Next.js 14**: React 全栈框架，使用 App Router
- **React 18**: 用户界面库，支持并发特性
- **TypeScript**: 类型安全的 JavaScript 超集

### 状态管理

- **Zustand**: 轻量级状态管理库
- **TanStack React Query**: 服务器状态管理和数据获取
- **React Hook Form**: 表单状态管理

### 样式和 UI

- **Tailwind CSS**: 实用优先的 CSS 框架
- **Lucide React**: 现代图标库
- **自定义组件**: 基于 Tailwind 的组件库

### 开发工具

- **ESLint**: 代码质量检查
- **TypeScript**: 静态类型检查
- **Sonner**: 通知和提示

## 项目结构

```
garage-webui-nextjs/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页 (仪表板)
│   │   ├── login/             # 登录页面
│   │   │   └── page.tsx
│   │   ├── cluster/           # 集群管理
│   │   │   └── page.tsx
│   │   ├── buckets/           # 存储桶管理
│   │   │   ├── page.tsx       # 存储桶列表
│   │   │   └── [id]/          # 存储桶详情
│   │   │       └── page.tsx
│   │   └── keys/              # 访问密钥管理
│   │       └── page.tsx
│   ├── components/            # React 组件
│   │   ├── ui/               # 基础 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── stats-card.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   ├── layout/           # 布局组件
│   │   │   ├── main-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   ├── auth/             # 认证组件
│   │   │   └── login-form.tsx
│   │   ├── dashboard/        # 仪表板组件
│   │   │   └── stats-grid.tsx
│   │   ├── cluster/          # 集群管理组件
│   │   ├── buckets/          # 存储桶组件
│   │   └── keys/             # 访问密钥组件
│   ├── hooks/                # 自定义 React 钩子
│   │   ├── use-nodes-health.ts
│   │   ├── use-buckets.ts
│   │   ├── use-cluster.ts
│   │   └── use-access-keys.ts
│   ├── lib/                  # 核心库和配置
│   │   ├── api.ts           # API 客户端配置
│   │   ├── constants.ts     # 应用常量
│   │   ├── utils.ts         # 工具函数
│   │   └── validations.ts   # Zod 验证模式
│   ├── stores/              # Zustand 状态存储
│   │   ├── auth-store.ts    # 认证状态
│   │   ├── theme-store.ts   # 主题状态
│   │   └── app-store.ts     # 应用全局状态
│   ├── types/               # TypeScript 类型定义
│   │   ├── index.ts         # 通用类型
│   │   ├── api.ts           # API 相关类型
│   │   └── garage.ts        # Garage 特定类型
│   └── utils/               # 辅助工具函数
│       ├── format.ts        # 格式化函数
│       ├── validation.ts    # 验证函数
│       └── storage.ts       # 本地存储工具
├── public/                  # 静态资源
│   ├── favicon.ico
│   └── images/
├── .github/                 # GitHub 配置
│   └── copilot-instructions.md
├── docs/                    # 项目文档
│   ├── GARAGE_WEBUI_FEATURES.md
│   ├── MIGRATION_GUIDE.md
│   └── ARCHITECTURE.md
├── .env.example            # 环境变量示例
├── .env.local              # 本地环境变量
├── .gitignore              # Git 忽略文件
├── .eslintrc.json          # ESLint 配置
├── next.config.js          # Next.js 配置
├── package.json            # 项目依赖
├── tailwind.config.js      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
├── README.md               # 项目说明
└── Dockerfile              # Docker 配置
```

## 核心架构模式

### 1. 页面架构 (App Router)

采用 Next.js 14 App Router 的文件系统路由：

```typescript
// app/layout.tsx - 根布局
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/page.tsx - 首页
export default function DashboardPage() {
  return <DashboardContent />;
}
```

### 2. 组件架构

采用分层组件架构：

```
UI 层级:
┌─ Pages (app/*/page.tsx)
├─ Layout Components (components/layout/)
├─ Feature Components (components/dashboard/, components/buckets/, etc.)
├─ UI Components (components/ui/)
└─ Primitive Elements (HTML elements)
```

### 3. 状态管理架构

多层状态管理策略：

```typescript
// 服务器状态 - React Query
const { data: health } = useQuery({
  queryKey: ["nodes", "health"],
  queryFn: fetchNodesHealth,
});

// 客户端状态 - Zustand
const { user, login, logout } = useAuthStore();

// 组件状态 - useState
const [isOpen, setIsOpen] = useState(false);
```

### 4. API 架构

统一的 API 客户端和钩子模式：

```typescript
// lib/api.ts - API 客户端
export const api = {
  nodes: {
    getHealth: () => fetch("/api/garage/health"),
    getStatus: () => fetch("/api/garage/status"),
  },
  buckets: {
    list: () => fetch("/api/garage/buckets"),
    create: (data) =>
      fetch("/api/garage/buckets", { method: "POST", body: data }),
  },
};

// hooks/use-nodes-health.ts - 数据钩子
export function useNodesHealth() {
  return useQuery({
    queryKey: ["nodes", "health"],
    queryFn: api.nodes.getHealth,
    refetchInterval: 5000,
  });
}
```

## 数据流架构

### 1. 数据获取流程

```
用户交互 → React Component → Custom Hook → React Query → API Client → Garage API
                                    ↓
用户界面 ← React Component ← Cache/State ← Response Processing ← HTTP Response
```

### 2. 状态更新流程

```
用户操作 → Event Handler → State Update (Zustand/React Query) → Component Re-render → UI Update
```

### 3. 认证流程

```
登录请求 → Auth Store → API Validation → Token Storage → Route Protection → Authenticated State
```

## 性能优化策略

### 1. 代码分割

```typescript
// 路由级别的代码分割
const ClusterPage = lazy(() => import("@/app/cluster/page"));

// 组件级别的动态导入
const ObjectBrowser = dynamic(
  () => import("@/components/buckets/object-browser"),
  {
    ssr: false,
    loading: () => <ObjectBrowserSkeleton />,
  }
);
```

### 2. 数据缓存

```typescript
// React Query 缓存配置
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      cacheTime: 10 * 60 * 1000, // 10分钟
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3. 渲染优化

```typescript
// 使用 React.memo 优化组件
const StatsCard = memo(({ title, value, icon }: StatsCardProps) => {
  return <div>...</div>;
});

// 使用 useMemo 优化计算
const totalUsage = useMemo(() => {
  return buckets?.reduce((acc, bucket) => acc + bucket.bytes, 0);
}, [buckets]);
```

## 安全架构

### 1. 认证和授权

```typescript
// 中间件级别的路由保护
export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token");
  if (!token && !isPublicRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// 组件级别的权限检查
function ProtectedComponent() {
  const { user } = useAuthStore();
  if (!user?.isAuthenticated) {
    return <LoginForm />;
  }
  return <SecureContent />;
}
```

### 2. API 安全

```typescript
// API 请求拦截器
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 测试架构

### 1. 测试策略

```
单元测试 (Jest + React Testing Library)
├─ 组件测试
├─ 钩子测试
├─ 工具函数测试
└─ 状态管理测试

集成测试 (Playwright)
├─ 页面交互测试
├─ API 集成测试
└─ 端到端用户流程测试

性能测试
├─ 加载时间测试
├─ 内存使用测试
└─ 网络请求优化测试
```

### 2. 测试文件组织

```
src/
├─ __tests__/           # 测试文件
│   ├─ components/      # 组件测试
│   ├─ hooks/           # 钩子测试
│   ├─ utils/           # 工具函数测试
│   └─ pages/           # 页面测试
├─ __mocks__/           # Mock 文件
└─ test-utils.tsx       # 测试工具
```

## 部署架构

### 1. 构建优化

```javascript
// next.config.js
const nextConfig = {
  output: "standalone",
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};
```

### 2. 容器化部署

```dockerfile
# 多阶段构建
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

## 监控和日志

### 1. 错误监控

```typescript
// 全局错误边界
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 记录错误到监控服务
    console.error("Global error:", error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### 2. 性能监控

```typescript
// Web Vitals 监控
export function reportWebVitals(metric: any) {
  switch (metric.name) {
    case "CLS":
    case "FID":
    case "FCP":
    case "LCP":
    case "TTFB":
      // 发送到分析服务
      console.log(metric);
      break;
    default:
      break;
  }
}
```

## 扩展和维护

### 1. 插件化架构

设计支持功能模块的插拔式扩展：

```typescript
// 功能模块注册
interface FeatureModule {
  name: string;
  routes: RouteConfig[];
  components: ComponentConfig[];
  hooks: HookConfig[];
}

// 插件注册系统
export const registerFeature = (module: FeatureModule) => {
  // 注册路由、组件等
};
```

### 2. 配置管理

统一的配置管理系统：

```typescript
// config/index.ts
export const config = {
  app: {
    name: APP_NAME,
    version: APP_VERSION,
  },
  api: {
    baseUrl: API_BASE_URL,
    timeout: 10000,
  },
  features: {
    darkMode: true,
    notifications: true,
  },
};
```

---

_此架构文档描述了 Garage Web UI Next.js 版本的完整技术架构，为开发和维护提供指导。_
