# Garage Web UI Next.js 迁移指南

本文档详细说明如何将原始的 React + Vite 版本的 Garage Web UI 迁移到 Next.js 14 版本，基于 [GARAGE_WEBUI_FEATURES.md](./GARAGE_WEBUI_FEATURES.md) 中详细分析的所有核心功能。

## 🎯 迁移目标

### 保持功能完整性

确保原项目的所有核心功能在 Next.js 版本中得到完整实现：

✅ **仪表板功能**

- 集群健康状态实时监控
- 节点统计信息展示
- 分区状态可视化
- 存储使用量统计

✅ **集群管理功能**

- 节点信息查看和管理
- 集群拓扑展示
- 节点添加/移除操作
- 负载均衡配置

✅ **存储桶管理功能**

- 桶的 CRUD 操作
- 对象浏览器集成
- 文件上传/下载/删除
- 权限和配额管理

✅ **访问密钥管理功能**

- 访问密钥生成和管理
- 细粒度权限控制
- 安全策略配置

✅ **认证系统功能**

- 用户登录验证
- 会话管理
- 安全保护机制

## 📋 功能模块迁移清单

### 1. 仪表板 (Dashboard) 迁移

#### 原始实现特点

```typescript
// 原始: src/pages/home/page.tsx
const HomePage = () => {
  const { data: health } = useNodesHealth();
  const { data: buckets } = useBuckets();

  const totalUsage = useMemo(() => {
    return buckets?.reduce((acc, bucket) => acc + bucket.bytes, 0);
  }, [buckets]);

  return (
    <div className="container">
      <Page title="Dashboard" />
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard title="Status" icon={Leaf} value={ucfirst(health?.status)} />
        <StatsCard title="Nodes" icon={HardDrive} value={health?.knownNodes} />
        {/* 更多统计卡片 */}
      </section>
    </div>
  );
};
```

#### Next.js 迁移步骤

**步骤 1: 创建页面结构**

```bash
# 创建仪表板页面
mkdir -p src/app
touch src/app/page.tsx
```

**步骤 2: 迁移组件代码**

```typescript
// Next.js: src/app/page.tsx
"use client";

import { Suspense } from "react";
import DashboardContent from "@/components/dashboard/dashboard-content";
import DashboardSkeleton from "@/components/dashboard/dashboard-skeleton";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
```

**步骤 3: 创建统计卡片组件**

```typescript
// src/components/dashboard/stats-grid.tsx
"use client";

import {
  Database,
  DatabaseZap,
  FileBox,
  FileCheck,
  FileClock,
  HardDrive,
  HardDriveUpload,
  Leaf,
  PieChart,
} from "lucide-react";
import { cn, readableBytes, ucfirst } from "@/lib/utils";
import { useNodesHealth, useBuckets } from "@/hooks";
import StatsCard from "@/components/ui/stats-card";

export default function StatsGrid() {
  const { data: health, isLoading: healthLoading } = useNodesHealth();
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();

  const totalUsage = useMemo(() => {
    return buckets?.reduce((acc, bucket) => acc + bucket.bytes, 0) || 0;
  }, [buckets]);

  if (healthLoading || bucketsLoading) {
    return <StatsGridSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <StatsCard
        title="集群状态"
        icon={Leaf}
        value={ucfirst(health?.status)}
        valueClassName={cn(
          "text-lg",
          health?.status === "healthy"
            ? "text-green-600"
            : health?.status === "degraded"
            ? "text-yellow-600"
            : "text-red-600"
        )}
      />
      <StatsCard title="节点总数" icon={HardDrive} value={health?.knownNodes} />
      <StatsCard
        title="已连接节点"
        icon={HardDriveUpload}
        value={health?.connectedNodes}
      />
      <StatsCard
        title="存储节点"
        icon={Database}
        value={health?.storageNodes}
      />
      <StatsCard
        title="活跃存储节点"
        icon={DatabaseZap}
        value={health?.storageNodesOk}
      />
      <StatsCard title="分区总数" icon={FileBox} value={health?.partitions} />
      <StatsCard
        title="法定人数分区"
        icon={FileClock}
        value={health?.partitionsQuorum}
      />
      <StatsCard
        title="正常分区"
        icon={FileCheck}
        value={health?.partitionsAllOk}
      />
      <StatsCard
        title="总存储使用量"
        icon={PieChart}
        value={readableBytes(totalUsage)}
      />
    </div>
  );
}
```

#### 迁移验收标准

- [ ] 实时健康状态更新 (5 秒间隔)
- [ ] 所有统计指标正确显示
- [ ] 响应式网格布局
- [ ] 加载状态和错误处理
- [ ] 颜色编码状态指示器

### 2. 集群管理 (Cluster Management) 迁移

#### 原始功能分析

- 节点列表展示
- 节点状态监控 (在线/离线)
- 集群拓扑可视化
- 节点配置管理

#### Next.js 迁移步骤

**步骤 1: 创建集群页面**

```bash
mkdir -p src/app/cluster
touch src/app/cluster/page.tsx
```

**步骤 2: 实现节点管理组件**

```typescript
// src/app/cluster/page.tsx
"use client";

import { Suspense } from "react";
import NodesTable from "@/components/cluster/nodes-table";
import ClusterTopology from "@/components/cluster/cluster-topology";
import ClusterStats from "@/components/cluster/cluster-stats";

export default function ClusterPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">集群管理</h1>
      </div>

      <Suspense fallback={<div>加载集群统计...</div>}>
        <ClusterStats />
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Suspense fallback={<div>加载节点列表...</div>}>
          <NodesTable />
        </Suspense>

        <Suspense fallback={<div>加载集群拓扑...</div>}>
          <ClusterTopology />
        </Suspense>
      </div>
    </div>
  );
}
```

**步骤 3: 节点表格组件**

```typescript
// src/components/cluster/nodes-table.tsx
"use client";

import { useClusterNodes } from "@/hooks/use-cluster";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";

export default function NodesTable() {
  const { data: nodes, isLoading } = useClusterNodes();

  if (isLoading) return <NodesTableSkeleton />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">集群节点</h2>
          <Button size="sm" icon={Plus}>
            添加节点
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                节点ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                地址
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                区域
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                容量
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {nodes?.map((node) => (
              <tr key={node.id}>
                <td className="px-6 py-4 font-mono text-sm">{node.id}</td>
                <td className="px-6 py-4 text-sm">{node.addr}</td>
                <td className="px-6 py-4">
                  <Badge variant={node.isUp ? "success" : "destructive"}>
                    {node.isUp ? "在线" : "离线"}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-sm">{node.zone}</td>
                <td className="px-6 py-4 text-sm">
                  {node.capacity ? readableBytes(node.capacity) : "—"}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" icon={MoreHorizontal}>
                    操作
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### 迁移验收标准

- [ ] 节点列表正确显示
- [ ] 实时状态更新
- [ ] 节点操作功能
- [ ] 集群拓扑可视化
- [ ] 响应式表格设计

### 3. 存储桶管理 (Bucket Management) 迁移

#### 原始功能特点

- 桶列表和详情页面
- 对象浏览器集成
- 文件上传/下载功能
- 权限和配额管理

#### Next.js 迁移步骤

**步骤 1: 创建桶管理页面结构**

```bash
mkdir -p src/app/buckets/[id]
touch src/app/buckets/page.tsx
touch src/app/buckets/[id]/page.tsx
```

**步骤 2: 桶列表页面**

```typescript
// src/app/buckets/page.tsx
"use client";

import { Suspense } from "react";
import BucketsGrid from "@/components/buckets/buckets-grid";
import CreateBucketDialog from "@/components/buckets/create-bucket-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BucketsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">存储桶管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理您的对象存储桶和文件
          </p>
        </div>
        <CreateBucketDialog>
          <Button icon={Plus}>创建存储桶</Button>
        </CreateBucketDialog>
      </div>

      <Suspense fallback={<BucketsGridSkeleton />}>
        <BucketsGrid />
      </Suspense>
    </div>
  );
}
```

**步骤 3: 桶详情和对象浏览器**

```typescript
// src/app/buckets/[id]/page.tsx
"use client";

import { use } from "react";
import { Suspense } from "react";
import BucketHeader from "@/components/buckets/bucket-header";
import ObjectBrowser from "@/components/buckets/object-browser";
import BucketSettings from "@/components/buckets/bucket-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BucketPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ prefix?: string; tab?: string }>;
}

export default function BucketPage({ params, searchParams }: BucketPageProps) {
  const { id } = use(params);
  const { prefix = "", tab = "files" } = use(searchParams);

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>加载存储桶信息...</div>}>
        <BucketHeader bucketId={id} />
      </Suspense>

      <Tabs defaultValue={tab} className="mt-6">
        <TabsList>
          <TabsTrigger value="files">文件浏览</TabsTrigger>
          <TabsTrigger value="settings">设置</TabsTrigger>
          <TabsTrigger value="permissions">权限</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-6">
          <Suspense fallback={<div>加载文件列表...</div>}>
            <ObjectBrowser bucketId={id} prefix={prefix} />
          </Suspense>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Suspense fallback={<div>加载设置...</div>}>
            <BucketSettings bucketId={id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <div>权限管理功能开发中...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**步骤 4: 对象浏览器组件**

```typescript
// src/components/buckets/object-browser.tsx
"use client";

import { useState } from "react";
import {
  useBucketObjects,
  useUploadObject,
  useDeleteObject,
} from "@/hooks/use-s3";
import { Button } from "@/components/ui/button";
import { Upload, Download, Trash2, Folder, File } from "lucide-react";
import { formatDate, readableBytes } from "@/lib/utils";

interface ObjectBrowserProps {
  bucketId: string;
  prefix: string;
}

export default function ObjectBrowser({
  bucketId,
  prefix,
}: ObjectBrowserProps) {
  const { data: objects, isLoading } = useBucketObjects(bucketId, prefix);
  const uploadMutation = useUploadObject();
  const deleteMutation = useDeleteObject();

  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      uploadMutation.mutate({
        bucketId,
        key: `${prefix}${file.name}`,
        file,
      });
    });
  };

  const handleDelete = (key: string) => {
    deleteMutation.mutate({ bucketId, key });
  };

  if (isLoading) return <ObjectBrowserSkeleton />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">位置:</span>
            <span className="font-mono text-sm">/{prefix}</span>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              multiple
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files)
              }
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button as="span" icon={Upload} size="sm">
                上传文件
              </Button>
            </label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">名称</th>
              <th className="px-4 py-3 text-left">大小</th>
              <th className="px-4 py-3 text-left">修改时间</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* 文件夹 */}
            {objects?.folders?.map((folder) => (
              <tr
                key={folder.prefix}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    <Link href={`/buckets/${bucketId}?prefix=${folder.prefix}`}>
                      <span className="text-blue-600 hover:underline">
                        {folder.prefix.replace(prefix, "").replace("/", "")}
                      </span>
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">—</td>
                <td className="px-4 py-3 text-gray-500">—</td>
                <td className="px-4 py-3"></td>
              </tr>
            ))}

            {/* 文件 */}
            {objects?.objects?.map((object) => (
              <tr
                key={object.key}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-gray-500" />
                    <span>{object.key.replace(prefix, "")}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{readableBytes(object.size)}</td>
                <td className="px-4 py-3">{formatDate(object.lastModified)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Download}
                      onClick={() => downloadObject(bucketId, object.key)}
                    >
                      下载
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDelete(object.key)}
                    >
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

#### 迁移验收标准

- [ ] 桶列表正确显示
- [ ] 文件上传功能正常
- [ ] 文件下载功能正常
- [ ] 文件删除功能正常
- [ ] 文件夹导航功能
- [ ] 批量操作支持
- [ ] 配额和权限管理

### 4. 访问密钥管理 (Access Key Management) 迁移

#### Next.js 迁移步骤

**步骤 1: 创建密钥管理页面**

```bash
mkdir -p src/app/keys
touch src/app/keys/page.tsx
```

**步骤 2: 密钥列表和管理**

```typescript
// src/app/keys/page.tsx
"use client";

import { Suspense } from "react";
import AccessKeysTable from "@/components/keys/access-keys-table";
import CreateKeyDialog from "@/components/keys/create-key-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AccessKeysPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">访问密钥管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            管理 S3 访问密钥和权限配置
          </p>
        </div>
        <CreateKeyDialog>
          <Button icon={Plus}>创建访问密钥</Button>
        </CreateKeyDialog>
      </div>

      <Suspense fallback={<div>加载访问密钥...</div>}>
        <AccessKeysTable />
      </Suspense>
    </div>
  );
}
```

**步骤 3: 密钥权限管理**

```typescript
// src/components/keys/key-permissions-dialog.tsx
"use client";

import { useState } from "react";
import { useAccessKey, useUpdateKeyPermissions } from "@/hooks/use-access-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface KeyPermissionsDialogProps {
  keyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyPermissionsDialog({
  keyId,
  open,
  onOpenChange,
}: KeyPermissionsDialogProps) {
  const { data: accessKey } = useAccessKey(keyId);
  const updatePermissions = useUpdateKeyPermissions();

  const [permissions, setPermissions] = useState(
    accessKey?.bucketPermissions || {}
  );

  const handleSave = () => {
    updatePermissions.mutate({
      keyId,
      permissions,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>配置访问权限</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            为访问密钥 <code className="bg-gray-100 px-1 rounded">{keyId}</code>{" "}
            配置存储桶权限
          </div>

          {Object.entries(permissions).map(([bucketId, perms]) => (
            <div key={bucketId} className="border rounded-lg p-4">
              <div className="font-medium mb-3">{bucketId}</div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">读取权限</span>
                  <Switch
                    checked={perms.read}
                    onCheckedChange={(checked) =>
                      setPermissions((prev) => ({
                        ...prev,
                        [bucketId]: { ...prev[bucketId], read: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">写入权限</span>
                  <Switch
                    checked={perms.write}
                    onCheckedChange={(checked) =>
                      setPermissions((prev) => ({
                        ...prev,
                        [bucketId]: { ...prev[bucketId], write: checked },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">所有者权限</span>
                  <Switch
                    checked={perms.owner}
                    onCheckedChange={(checked) =>
                      setPermissions((prev) => ({
                        ...prev,
                        [bucketId]: { ...prev[bucketId], owner: checked },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave} loading={updatePermissions.isPending}>
            保存权限
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 迁移验收标准

- [ ] 访问密钥列表显示
- [ ] 密钥创建功能
- [ ] 密钥删除功能
- [ ] 权限配置界面
- [ ] 安全密钥生成
- [ ] 权限继承管理

### 5. 认证系统 (Authentication) 迁移

#### Next.js 迁移步骤

**步骤 1: 创建登录页面**

```bash
mkdir -p src/app/login
touch src/app/login/page.tsx
```

**步骤 2: 认证中间件**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { STORAGE_KEYS } from "@/lib/constants";

const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否为公共路由
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 检查认证 token
  const authToken = request.cookies.get(STORAGE_KEYS.AUTH_TOKEN);

  if (!authToken) {
    // 重定向到登录页面
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**步骤 3: 登录页面实现**

```typescript
// src/app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const from = searchParams.get("from") || "/";

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace(from);
    }
  }, [user, router, from]);

  if (user?.isAuthenticated) {
    return null; // 或显示加载状态
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Garage Web UI
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            请登录以管理您的对象存储
          </p>
        </div>
        <LoginForm redirectTo={from} />
      </div>
    </div>
  );
}
```

#### 迁移验收标准

- [ ] 登录表单功能正常
- [ ] 密码验证正确
- [ ] 会话状态持久化
- [ ] 自动重定向功能
- [ ] 登出功能正常
- [ ] 路由保护机制

## 🔧 API 集成迁移

### Garage Admin API 集成

```typescript
// src/lib/api/garage-admin.ts
import { API_BASE_URL, API_ADMIN_KEY } from "@/lib/constants";

const adminHeaders = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${API_ADMIN_KEY}`,
};

export const garageAdminApi = {
  // 健康状态检查
  getHealth: async (): Promise<NodesHealth> => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch health");
    return response.json();
  },

  // 集群状态
  getStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/status`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch status");
    return response.json();
  },

  // 存储桶管理
  getBuckets: async (): Promise<Bucket[]> => {
    const response = await fetch(`${API_BASE_URL}/buckets`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch buckets");
    return response.json();
  },

  createBucket: async (data: CreateBucketRequest) => {
    const response = await fetch(`${API_BASE_URL}/buckets`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create bucket");
    return response.json();
  },

  // 访问密钥管理
  getAccessKeys: async (): Promise<AccessKey[]> => {
    const response = await fetch(`${API_BASE_URL}/keys`, {
      headers: adminHeaders,
    });
    if (!response.ok) throw new Error("Failed to fetch keys");
    return response.json();
  },

  createAccessKey: async (data: CreateKeyRequest) => {
    const response = await fetch(`${API_BASE_URL}/keys`, {
      method: "POST",
      headers: adminHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create key");
    return response.json();
  },
};
```

### S3 API 集成

```typescript
// src/lib/api/s3.ts
import { S3_ENDPOINT_URL, S3_REGION } from "@/lib/constants";

export const s3Api = {
  // 列出对象
  listObjects: async (bucketName: string, prefix: string = "") => {
    const params = new URLSearchParams({
      "list-type": "2",
      prefix,
      delimiter: "/",
      "max-keys": "1000",
    });

    const response = await fetch(`${S3_ENDPOINT_URL}/${bucketName}?${params}`, {
      headers: {
        Authorization: await generateS3Signature(bucketName, params),
      },
    });

    if (!response.ok) throw new Error("Failed to list objects");
    const xmlText = await response.text();
    return parseS3ListResponse(xmlText);
  },

  // 上传对象
  uploadObject: async (bucketName: string, key: string, file: File) => {
    const response = await fetch(`${S3_ENDPOINT_URL}/${bucketName}/${key}`, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        Authorization: await generateS3Signature(bucketName, key, "PUT"),
      },
      body: file,
    });

    if (!response.ok) throw new Error("Failed to upload object");
    return response;
  },

  // 删除对象
  deleteObject: async (bucketName: string, key: string) => {
    const response = await fetch(`${S3_ENDPOINT_URL}/${bucketName}/${key}`, {
      method: "DELETE",
      headers: {
        Authorization: await generateS3Signature(bucketName, key, "DELETE"),
      },
    });

    if (!response.ok) throw new Error("Failed to delete object");
    return response;
  },
};
```

## 📋 完整迁移检查清单

### 🎯 功能完整性检查

#### 仪表板功能

- [ ] 集群健康状态实时显示
- [ ] 节点统计信息正确
- [ ] 分区状态监控
- [ ] 存储使用量统计
- [ ] 状态颜色编码
- [ ] 自动刷新机制 (5 秒)

#### 集群管理功能

- [ ] 节点列表完整显示
- [ ] 节点状态准确更新
- [ ] 集群拓扑可视化
- [ ] 节点操作功能
- [ ] 容量和区域信息
- [ ] 节点添加/移除

#### 存储桶管理功能

- [ ] 桶列表和详情
- [ ] 文件上传功能
- [ ] 文件下载功能
- [ ] 文件删除功能
- [ ] 文件夹导航
- [ ] 批量操作
- [ ] 权限配置
- [ ] 配额管理

#### 访问密钥管理功能

- [ ] 密钥列表显示
- [ ] 密钥创建功能
- [ ] 密钥删除功能
- [ ] 权限配置界面
- [ ] 细粒度权限控制
- [ ] 安全密钥生成

#### 认证系统功能

- [ ] 用户登录验证
- [ ] 密码哈希验证
- [ ] 会话状态管理
- [ ] 自动登出机制
- [ ] 路由访问控制
- [ ] 重定向功能

### ⚡ 性能和体验检查

#### Next.js 优化

- [ ] 服务端渲染 (SSR)
- [ ] 静态生成 (SSG) 适用页面
- [ ] 代码分割和懒加载
- [ ] 图像优化
- [ ] 字体优化

#### 用户体验

- [ ] 加载状态指示器
- [ ] 错误处理和提示
- [ ] 响应式设计
- [ ] 无障碍性支持
- [ ] 深色模式切换

#### 数据管理

- [ ] React Query 缓存策略
- [ ] 乐观更新
- [ ] 离线状态处理
- [ ] 错误重试机制
- [ ] 数据同步

### 🔒 安全性检查

#### 认证安全

- [ ] bcrypt 密码哈希
- [ ] JWT token 验证
- [ ] 会话超时处理
- [ ] CSRF 保护
- [ ] XSS 防护

#### API 安全

- [ ] Admin token 验证
- [ ] 请求签名验证
- [ ] 错误信息保护
- [ ] 速率限制
- [ ] 输入验证

### 🛠️ 开发和部署检查

#### 开发环境

- [ ] 开发服务器正常启动
- [ ] 热重载功能正常
- [ ] TypeScript 类型检查
- [ ] ESLint 代码检查
- [ ] 测试套件运行

#### 生产部署

- [ ] 构建优化
- [ ] 环境变量配置
- [ ] Docker 容器化
- [ ] 性能监控
- [ ] 错误追踪

---

_此迁移指南确保了从原始 React + Vite 版本到 Next.js 版本的完整功能迁移，同时增加了现代化的性能优化和用户体验改进。_
