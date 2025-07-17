# Garage Web UI Next.js 开发计划

基于当前项目状态和文档分析，制定明确可实现的开发计划。

## 📊 当前项目状态分析

### ✅ 已完成基础架构

- Next.js 14 项目初始化和配置
- TypeScript + Tailwind CSS 集成
- 核心依赖包安装完成
- 基础工具函数和类型定义
- Zustand 状态管理框架
- 基础 UI 组件 (Button, StatsCard)
- 完整文档体系

### 🎯 开发目标

基于原项目的 5 大核心功能模块，实现完整的 Garage 对象存储管理界面。

## 🚀 阶段化开发计划

### 阶段 1: 基础功能实现 (第 1-2 周)

#### 1.1 认证系统 (优先级: 🔥 最高)

**预估时间**: 2-3 天

**具体任务**:

- [ ] 完善登录表单组件
- [ ] 实现路由保护中间件
- [ ] 集成认证 API
- [ ] 添加登出功能

**验收标准**:

```typescript
// 实现文件清单
src / app / login / page.tsx; // 登录页面
src / components / auth / login - form.tsx; // 登录表单
src / middleware.ts; // 路由保护
src / lib / auth.ts; // 认证工具函数
```

**技术实现要点**:

- 使用 React Hook Form + Zod 表单验证
- bcrypt 密码验证 (与原项目兼容)
- JWT token 会话管理
- 自动重定向功能

#### 1.2 基础 UI 组件库 (优先级: 🔥 高)

**预估时间**: 2-3 天

**具体任务**:

- [ ] 创建 Input 输入组件
- [ ] 创建 Card 卡片组件
- [ ] 创建 Badge 徽章组件
- [ ] 创建 Loading 加载组件
- [ ] 创建 Table 表格组件

**验收标准**:

```typescript
// 组件库文件清单
src / components / ui / input.tsx; // 输入框组件
src / components / ui / card.tsx; // 卡片组件
src / components / ui / badge.tsx; // 徽章组件
src / components / ui / loading.tsx; // 加载组件
src / components / ui / table.tsx; // 表格组件
```

#### 1.3 布局系统完善 (优先级: 🔥 高)

**预估时间**: 2 天

**具体任务**:

- [ ] 完成 Sidebar 侧边栏组件
- [ ] 实现导航菜单
- [ ] 添加用户信息显示
- [ ] 集成主题切换功能

**验收标准**:

```typescript
// 布局组件文件清单
src / components / layout / sidebar.tsx; // 侧边栏
src / components / layout / header.tsx; // 顶部导航
src / components / layout / nav - menu.tsx; // 导航菜单
src / components / layout / user - menu.tsx; // 用户菜单
```

### 阶段 2: 核心功能模块 (第 3-4 周)

#### 2.1 仪表板功能 (优先级: 🔥 高)

**预估时间**: 3-4 天

**具体任务**:

- [ ] 实现健康状态 API 集成
- [ ] 创建统计网格组件
- [ ] 添加实时数据更新 (5 秒间隔)
- [ ] 实现状态指示器

**API 集成要点**:

```typescript
// API 钩子实现
const useNodesHealth = () =>
  useQuery({
    queryKey: ["nodes", "health"],
    queryFn: () => fetch(`${API_BASE_URL}/health`).then((res) => res.json()),
    refetchInterval: 5000,
  });
```

**验收标准**:

- 9 个统计卡片正确显示
- 健康状态颜色编码 (绿/黄/红)
- 自动刷新功能正常
- 响应式布局适配

#### 2.2 集群管理功能 (优先级: 🟡 中)

**预估时间**: 4-5 天

**具体任务**:

- [ ] 实现节点列表 API 集成
- [ ] 创建节点表格组件
- [ ] 添加节点状态监控
- [ ] 实现集群统计展示

**验收标准**:

- 节点列表完整显示
- 节点状态实时更新
- 支持节点操作菜单
- 集群健康度统计

#### 2.3 存储桶列表功能 (优先级: 🟡 中)

**预估时间**: 3-4 天

**具体任务**:

- [ ] 实现存储桶 API 集成
- [ ] 创建桶列表组件
- [ ] 添加桶创建功能
- [ ] 实现桶删除功能

**验收标准**:

- 桶列表网格显示
- 桶创建对话框
- 桶基本信息展示
- CRUD 操作正常

### 阶段 3: 高级功能模块 (第 5-6 周)

#### 3.1 对象浏览器 (优先级: 🟡 中)

**预估时间**: 5-6 天

**具体任务**:

- [ ] 实现 S3 API 集成
- [ ] 创建文件列表组件
- [ ] 实现文件上传功能
- [ ] 添加文件下载功能
- [ ] 实现文件删除功能

**技术实现要点**:

- S3 签名认证
- 文件流处理
- 进度指示器
- 批量操作支持

#### 3.2 访问密钥管理 (优先级: 🟢 低)

**预估时间**: 3-4 天

**具体任务**:

- [ ] 实现访问密钥 API 集成
- [ ] 创建密钥列表组件
- [ ] 添加密钥创建功能
- [ ] 实现权限配置界面

### 阶段 4: 优化和完善 (第 7-8 周)

#### 4.1 用户体验优化

- [ ] 添加加载骨架屏
- [ ] 实现错误边界处理
- [ ] 优化移动端体验
- [ ] 添加操作确认对话框

#### 4.2 性能优化

- [ ] 实现 SSR/SSG
- [ ] 配置缓存策略
- [ ] 代码分割优化
- [ ] 图像和资源优化

## 📋 详细实现清单

### 第 1 周任务拆解

#### Day 1-2: 认证系统

```bash
# 创建认证相关文件
touch src/app/login/page.tsx
touch src/components/auth/login-form.tsx
touch src/middleware.ts
touch src/lib/auth.ts

# 实现登录表单验证
# 集成 bcrypt 密码验证
# 实现 JWT token 管理
```

#### Day 3-4: UI 组件库

```bash
# 创建基础 UI 组件
touch src/components/ui/input.tsx
touch src/components/ui/card.tsx
touch src/components/ui/badge.tsx
touch src/components/ui/loading.tsx
touch src/components/ui/table.tsx

# 实现组件变体和状态
# 添加组件文档和示例
```

#### Day 5-7: 布局系统

```bash
# 完善布局组件
touch src/components/layout/sidebar.tsx
touch src/components/layout/header.tsx
touch src/components/layout/nav-menu.tsx

# 集成导航路由
# 实现响应式设计
```

### 第 2 周任务拆解

#### Day 1-3: 仪表板功能

```bash
# 创建仪表板组件
touch src/app/page.tsx
touch src/components/dashboard/dashboard-content.tsx
touch src/components/dashboard/stats-grid.tsx
touch src/hooks/use-nodes-health.ts

# API 集成和数据展示
# 实时更新机制
```

#### Day 4-7: 集群管理

```bash
# 创建集群管理页面
touch src/app/cluster/page.tsx
touch src/components/cluster/nodes-table.tsx
touch src/components/cluster/cluster-stats.tsx
touch src/hooks/use-cluster.ts

# 节点列表和操作
# 集群状态监控
```

## 🔧 技术实现规范

### 代码结构规范

```typescript
// 页面组件示例
"use client";
import { Suspense } from "react";

export default function PageName() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<LoadingSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
```

### API 钩子规范

```typescript
// 数据获取钩子示例
export function useApiData() {
  return useQuery({
    queryKey: ["api", "data"],
    queryFn: apiFunction,
    staleTime: 30000,
    refetchInterval: 5000,
  });
}
```

### 组件命名规范

- 页面组件: `PageName.tsx` (PascalCase)
- UI 组件: `component-name.tsx` (kebab-case)
- 钩子函数: `use-feature-name.ts` (kebab-case)
- 工具函数: `utility-name.ts` (kebab-case)

## 📊 进度追踪

### 里程碑检查点

**第 1 周结束**:

- [ ] 认证系统完全可用
- [ ] 基础 UI 组件库完成
- [ ] 布局系统正常工作

**第 2 周结束**:

- [ ] 仪表板功能完整
- [ ] 集群管理基础功能
- [ ] API 集成正常

**第 4 周结束**:

- [ ] 所有核心功能模块完成
- [ ] 基本的 CRUD 操作正常
- [ ] 用户界面完整可用

**第 6 周结束**:

- [ ] 高级功能完整
- [ ] 对象浏览器正常工作
- [ ] 权限管理功能完成

**第 8 周结束**:

- [ ] 项目优化完成
- [ ] 性能达到预期
- [ ] 准备生产部署

## 🎯 成功标准

### 功能完整性

- 所有原项目功能在 Next.js 版本中正常工作
- API 集成稳定可靠
- 用户体验良好

### 技术指标

- 首屏加载时间 < 2 秒
- 交互响应时间 < 500ms
- 移动端适配完整
- TypeScript 类型覆盖率 > 90%

### 代码质量

- ESLint 无错误
- 组件复用率高
- 代码注释完整
- 文档同步更新

---

_此开发计划基于当前项目状态制定，可根据实际开发进度进行调整。重点确保核心功能的稳定实现，然后逐步完善用户体验和性能优化。_
