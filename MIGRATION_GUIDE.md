# Garage Web UI Next.js 迁移指南 - 概览

本文档提供将原始的 React + Vite 版本的 Garage Web UI 迁移到 Next.js 14 版本的概览。

> 📋 **详细迁移指南**: 请参考 [MIGRATION_GUIDE_DETAILED.md](./MIGRATION_GUIDE_DETAILED.md) 获取完整的迁移步骤和代码示例。

## 🎯 迁移目标

将原项目的所有核心功能完整迁移到 Next.js，同时提升性能和开发体验：

### 核心功能保持

✅ **仪表板** - 集群健康状态、统计信息展示  
✅ **集群管理** - 节点管理、集群拓扑、配置操作  
✅ **存储桶管理** - 桶操作、对象浏览器、权限配置  
✅ **访问密钥管理** - 密钥创建、权限分配、安全管理  
✅ **认证系统** - 用户登录、会话管理、安全保护

### 技术升级

⚡ **Next.js 14** - 使用 App Router 和服务端渲染  
🎨 **现代 UI** - 移除 DaisyUI，使用自定义 Tailwind 组件  
📱 **响应式设计** - 优化移动端和平板体验  
🔧 **TypeScript** - 完善类型定义和类型安全  
🚀 **性能优化** - 代码分割、图像优化、缓存策略

## 📊 技术栈对比

| 功能         | 原版本                | Next.js 版本            | 变更说明                |
| ------------ | --------------------- | ----------------------- | ----------------------- |
| **框架**     | React 18 + Vite       | Next.js 14 (App Router) | 完全重构为 Next.js 应用 |
| **路由**     | React Router DOM      | 文件系统路由            | 使用 Next.js 约定式路由 |
| **样式**     | Tailwind + DaisyUI    | Tailwind + 自定义组件   | 移除 UI 库依赖          |
| **状态管理** | Zustand               | Zustand                 | 保持不变                |
| **数据获取** | React Query           | React Query + SSR       | 添加服务端渲染支持      |
| **表单处理** | React Hook Form + Zod | React Hook Form + Zod   | 保持不变                |

## 🗂️ 目录结构变更

### 原始结构

```
src/
├── app/              # 应用配置
├── pages/            # 页面组件
├── components/       # React 组件
├── hooks/            # 自定义钩子
├── lib/              # 工具库
└── context/          # React Context
```

### Next.js 结构

```
src/
├── app/              # Next.js App Router 页面
│   ├── page.tsx     # 仪表板 (/)
│   ├── login/       # 登录 (/login)
│   ├── cluster/     # 集群管理 (/cluster)
│   ├── buckets/     # 存储桶管理 (/buckets)
│   └── keys/        # 访问密钥 (/keys)
├── components/       # React 组件
│   ├── ui/          # 基础 UI 组件
│   ├── layout/      # 布局组件
│   └── [feature]/   # 功能特定组件
├── hooks/            # 自定义钩子
├── lib/              # 工具和配置
├── stores/           # Zustand 状态管理
├── types/            # TypeScript 类型
└── utils/            # 辅助函数
```

## 🚀 核心功能迁移

### 1. 路由系统迁移

**原始路由 (React Router)**

```typescript
const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/cluster", Component: ClusterPage },
  { path: "/buckets", Component: BucketsPage },
  { path: "/buckets/:id", Component: ManageBucketPage },
  { path: "/keys", Component: KeysPage },
]);
```

**Next.js 文件系统路由**

```
app/
├── page.tsx          # / (HomePage)
├── cluster/page.tsx  # /cluster
├── buckets/
│   ├── page.tsx      # /buckets
│   └── [id]/page.tsx # /buckets/[id]
└── keys/page.tsx     # /keys
```

### 2. 组件迁移

**页面组件示例**

```typescript
// 原始: src/pages/home/page.tsx
const HomePage = () => {
  const { data: health } = useNodesHealth();
  return <div>Dashboard Content</div>;
};

// Next.js: src/app/page.tsx
("use client");
export default function HomePage() {
  const { data: health } = useNodesHealth();
  return <div>Dashboard Content</div>;
}
```

### 3. API 集成迁移

**保持现有 API 结构**

- Garage Admin API (健康状态、集群管理、存储桶、密钥)
- S3 Compatible API (对象存储操作)
- 认证 API (登录验证)

## 📋 迁移步骤

### 阶段 1: 基础架构

1. ✅ 创建 Next.js 14 项目
2. ✅ 配置 TypeScript 和 Tailwind
3. ✅ 设置基础目录结构
4. ✅ 安装核心依赖包

### 阶段 2: 核心功能

1. 🔄 实现认证系统和路由保护
2. 🔄 迁移仪表板页面和统计组件
3. 🔄 实现集群管理功能
4. 🔄 开发存储桶管理和对象浏览器
5. 🔄 构建访问密钥管理界面

### 阶段 3: 优化完善

1. ⏳ 添加 SSR/SSG 支持
2. ⏳ 实现缓存策略
3. ⏳ 优化性能和用户体验
4. ⏳ 完善错误处理和加载状态
5. ⏳ 添加测试和文档

### 阶段 4: 部署发布

1. ⏳ Docker 容器化
2. ⏳ 环境配置优化
3. ⏳ 生产环境测试
4. ⏳ 性能监控集成

## 🛠️ 开发指南

### 环境设置

```bash
# 克隆项目
git clone <repository>
cd garage-webui-nextjs

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 设置 Garage 连接信息

# 启动开发服务器
npm run dev
```

### 关键配置文件

- `next.config.js` - Next.js 配置
- `tailwind.config.js` - Tailwind CSS 配置
- `tsconfig.json` - TypeScript 配置
- `.env.example` - 环境变量模板

## 📚 相关文档

- 📋 [功能特性文档](./GARAGE_WEBUI_FEATURES.md) - 原项目功能分析
- 🔧 [详细迁移指南](./MIGRATION_GUIDE_DETAILED.md) - 完整迁移步骤和代码
- 🏗️ [架构设计文档](./ARCHITECTURE.md) - Next.js 项目架构
- 📡 [API 参考文档](./API_REFERENCE.md) - Garage API 集成指南

## ✅ 迁移检查清单

### 功能完整性

- [ ] 仪表板健康监控和统计
- [ ] 集群节点管理和拓扑
- [ ] 存储桶和对象浏览器
- [ ] 访问密钥权限管理
- [ ] 用户认证和会话管理

### 技术实现

- [ ] Next.js App Router 配置
- [ ] 响应式 UI 组件
- [ ] React Query 数据管理
- [ ] TypeScript 类型安全
- [ ] 错误处理和加载状态

### 性能优化

- [ ] 服务端渲染 (SSR)
- [ ] 代码分割和懒加载
- [ ] 图像和字体优化
- [ ] 缓存策略配置
- [ ] 移动端性能优化

---

_迁移到 Next.js 14 版本将为 Garage Web UI 带来更好的性能、开发体验和现代化的技术架构。_

## 迁移概述

### 原始技术栈 vs Next.js 版本

| 组件         | 原始版本              | Next.js 版本            | 迁移策略                     |
| ------------ | --------------------- | ----------------------- | ---------------------------- |
| **框架**     | React 18 + Vite       | Next.js 14 (App Router) | 重构为 Next.js 应用结构      |
| **路由**     | React Router DOM      | Next.js App Router      | 迁移路由配置到文件系统路由   |
| **构建工具** | Vite                  | Next.js (Turbopack)     | 使用 Next.js 内置构建系统    |
| **状态管理** | Zustand               | Zustand                 | 保持不变                     |
| **数据获取** | TanStack React Query  | TanStack React Query    | 保持不变，添加 SSR 支持      |
| **样式**     | Tailwind + DaisyUI    | Tailwind CSS            | 移除 DaisyUI，使用自定义组件 |
| **表单**     | React Hook Form + Zod | React Hook Form + Zod   | 保持不变                     |
| **图标**     | Lucide React          | Lucide React            | 保持不变                     |
| **通知**     | Sonner                | Sonner                  | 保持不变                     |

## 核心架构变更

### 1. 项目结构迁移

**原始结构:**

```
src/
├── app/
│   ├── app.tsx
│   ├── router.tsx
│   └── styles.css
├── pages/
│   ├── auth/
│   ├── home/
│   ├── cluster/
│   ├── buckets/
│   └── keys/
├── components/
├── hooks/
├── lib/
└── context/
```

**Next.js 结构:**

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页 (原 home/page)
│   ├── login/             # 登录页面
│   ├── cluster/           # 集群管理
│   ├── buckets/           # 存储桶管理
│   └── keys/              # 访问密钥管理
├── components/
│   ├── ui/                # 基础 UI 组件
│   ├── layout/            # 布局组件
│   └── auth/              # 认证组件
├── hooks/                 # 自定义钩子
├── lib/                   # 工具函数
├── stores/                # Zustand 状态管理
├── types/                 # TypeScript 类型定义
└── utils/                 # 辅助函数
```

### 2. 路由系统迁移

**原始路由配置 (React Router):**

```typescript
const router = createBrowserRouter([
  {
    path: "/auth",
    Component: AuthLayout,
    children: [{ path: "login", Component: LoginPage }],
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "cluster", Component: ClusterPage },
      {
        path: "buckets",
        children: [
          { index: true, Component: BucketsPage },
          { path: ":id", Component: ManageBucketPage },
        ],
      },
      { path: "keys", Component: KeysPage },
    ],
  },
]);
```

**Next.js 文件系统路由:**

```
src/app/
├── page.tsx              # / (HomePage)
├── login/
│   └── page.tsx          # /login (LoginPage)
├── cluster/
│   └── page.tsx          # /cluster (ClusterPage)
├── buckets/
│   ├── page.tsx          # /buckets (BucketsPage)
│   └── [id]/
│       └── page.tsx      # /buckets/[id] (ManageBucketPage)
└── keys/
    └── page.tsx          # /keys (KeysPage)
```

### 3. 认证系统迁移

**原始实现 (客户端路由保护):**

```typescript
// AuthLayout.tsx
const AuthLayout = () => {
  // 在布局组件中处理认证逻辑
};

// MainLayout.tsx
const MainLayout = () => {
  const { user } = useAuthStore();
  if (!user?.isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  // 渲染主要内容
};
```

**Next.js 实现 (中间件 + 布局):**

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 检查认证状态，重定向未认证用户
}

// layout.tsx
export default function RootLayout() {
  return (
    <html>
      <body>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// 页面组件中的认证检查
const ProtectedPage = () => {
  const { user } = useAuthStore();
  if (!user) return <LoginForm />;
  return <PageContent />;
};
```

## 组件迁移策略

### 1. 页面组件迁移

**步骤:**

1. 将 `src/pages/` 下的组件移动到 `src/app/` 对应目录
2. 重命名为 `page.tsx`
3. 添加必要的 Next.js 元数据
4. 处理客户端状态管理

**示例迁移:**

```typescript
// 原始: src/pages/home/page.tsx
const HomePage = () => {
  const { data: health } = useNodesHealth();
  return <div>...</div>;
};

// Next.js: src/app/page.tsx
("use client");
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Garage Web UI",
  description: "Garage storage cluster dashboard",
};

export default function HomePage() {
  const { data: health } = useNodesHealth();
  return <div>...</div>;
}
```

### 2. 布局组件迁移

**主布局迁移:**

```typescript
// 原始: src/components/layouts/main-layout.tsx
const MainLayout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
};

// Next.js: src/components/layout/main-layout.tsx
("use client");
export default function MainLayout({ children }) {
  const { user } = useAuthStore();

  if (!user?.isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

### 3. API 钩子迁移

保持原有的 React Query 钩子不变，但添加 SSR 支持：

```typescript
// hooks/use-nodes-health.ts
export function useNodesHealth() {
  return useQuery({
    queryKey: ["nodes", "health"],
    queryFn: fetchNodesHealth,
    refetchInterval: 5000, // 5秒刷新
    staleTime: 2000,
  });
}

// 添加 SSR 预取支持
export async function getNodesHealthPrefetch() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["nodes", "health"],
    queryFn: fetchNodesHealth,
  });
  return dehydrate(queryClient);
}
```

## UI 组件库迁移

### 1. 从 DaisyUI 迁移到自定义组件

**原始 DaisyUI 组件:**

```typescript
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Title</h2>
    <p>Content</p>
  </div>
</div>
```

**自定义组件:**

```typescript
// components/ui/card.tsx
export function Card({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg shadow-sm border",
        className
      )}
    >
      {children}
    </div>
  );
}

// 使用
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>;
```

### 2. 主题系统迁移

**原始主题 (DaisyUI):**

```css
[data-theme="light"] {
  /* 样式 */
}
[data-theme="dark"] {
  /* 样式 */
}
```

**Tailwind 原生主题:**

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

## 数据获取优化

### 1. 添加 SSR 支持

```typescript
// app/page.tsx - 服务端预取数据
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

export default async function HomePage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["nodes", "health"],
    queryFn: fetchNodesHealth,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardContent />
    </HydrationBoundary>
  );
}
```

### 2. 流式渲染支持

```typescript
// 使用 React 18 Suspense
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
```

## 性能优化策略

### 1. 代码分割

- 使用 Next.js 自动代码分割
- 动态导入大型组件
- 路由级别的懒加载

### 2. 图像优化

- 使用 Next.js Image 组件
- 自动格式转换和大小优化
- 懒加载和占位符

### 3. 缓存策略

- 静态生成适用的页面
- API 路由缓存
- CDN 集成

## 部署和配置

### 1. 环境变量配置

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3903
NEXT_PUBLIC_S3_ENDPOINT_URL=http://localhost:3900
NEXT_PUBLIC_S3_REGION=garage
API_ADMIN_KEY=your-admin-key
```

### 2. Docker 配置

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM base AS runtime
COPY --from=build /app/.next ./.next
CMD ["npm", "start"]
```

## 测试策略

### 1. 单元测试

- Jest + React Testing Library
- 组件测试覆盖
- 钩子测试

### 2. 集成测试

- API 集成测试
- 端到端测试 (Playwright)
- 性能测试

## 迁移检查清单

### 功能迁移

- [ ] 仪表板页面和统计卡片
- [ ] 集群管理页面
- [ ] 存储桶管理和对象浏览器
- [ ] 访问密钥管理
- [ ] 用户认证系统
- [ ] 主题切换功能

### 技术实现

- [ ] Next.js App Router 配置
- [ ] Tailwind CSS 样式迁移
- [ ] React Query 集成
- [ ] Zustand 状态管理
- [ ] TypeScript 类型定义
- [ ] 错误处理和加载状态

### 优化和增强

- [ ] SSR/SSG 实现
- [ ] 性能优化
- [ ] SEO 优化
- [ ] 无障碍性改进
- [ ] 移动端响应式设计

### 部署和运维

- [ ] Docker 容器化
- [ ] 环境变量配置
- [ ] 生产环境优化
- [ ] 监控和日志
- [ ] 文档更新

---

_此迁移指南旨在确保从原始 React + Vite 版本到 Next.js 版本的平滑过渡，同时保持所有核心功能并添加现代化的性能优化。_
