# 第二周实现任务 - 仪表板与核心功能

## 🎯 第二周开发目标

基于第一周的认证系统和基础组件，实现仪表板页面和核心 API 集成功能。

## 📋 Day 8-9: API 集成与数据获取

### 任务 1.1: 创建 API 客户端 (4 小时)

**创建文件**:

```bash
touch src/lib/api-client.ts
```

**实现代码**:

```typescript
// src/lib/api-client.ts
import { GarageAPI } from "@/types";

class APIClient {
  private baseURL: string;
  private adminKey: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3903";
    this.adminKey = process.env.NEXT_PUBLIC_API_ADMIN_KEY || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.adminKey}`,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API Request failed:", error);
      throw error;
    }
  }

  // 健康检查
  async getHealth(): Promise<GarageAPI.HealthResponse> {
    return this.request<GarageAPI.HealthResponse>("/health");
  }

  // 获取集群状态
  async getClusterStatus(): Promise<GarageAPI.ClusterStatus> {
    return this.request<GarageAPI.ClusterStatus>("/v0/status");
  }

  // 获取集群布局
  async getClusterLayout(): Promise<GarageAPI.ClusterLayout> {
    return this.request<GarageAPI.ClusterLayout>("/v0/layout");
  }

  // 获取节点列表
  async getNodes(): Promise<GarageAPI.Node[]> {
    const status = await this.getClusterStatus();
    return status.nodes || [];
  }

  // 获取存储桶列表
  async getBuckets(): Promise<GarageAPI.Bucket[]> {
    return this.request<GarageAPI.Bucket[]>("/v0/bucket");
  }

  // 获取存储桶信息
  async getBucket(id: string): Promise<GarageAPI.BucketInfo> {
    return this.request<GarageAPI.BucketInfo>(`/v0/bucket?id=${id}`);
  }

  // 创建存储桶
  async createBucket(
    data: GarageAPI.CreateBucketRequest
  ): Promise<GarageAPI.BucketInfo> {
    return this.request<GarageAPI.BucketInfo>("/v0/bucket", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 删除存储桶
  async deleteBucket(id: string): Promise<void> {
    return this.request<void>(`/v0/bucket?id=${id}`, {
      method: "DELETE",
    });
  }

  // 获取访问密钥列表
  async getKeys(): Promise<GarageAPI.Key[]> {
    return this.request<GarageAPI.Key[]>("/v0/key");
  }

  // 获取访问密钥信息
  async getKey(id: string): Promise<GarageAPI.KeyInfo> {
    return this.request<GarageAPI.KeyInfo>(`/v0/key?id=${id}`);
  }

  // 创建访问密钥
  async createKey(
    data: GarageAPI.CreateKeyRequest
  ): Promise<GarageAPI.KeyInfo> {
    return this.request<GarageAPI.KeyInfo>("/v0/key", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 删除访问密钥
  async deleteKey(id: string): Promise<void> {
    return this.request<void>(`/v0/key?id=${id}`, {
      method: "DELETE",
    });
  }

  // 更新访问密钥权限
  async updateKeyPermissions(
    id: string,
    permissions: GarageAPI.KeyPermissions
  ): Promise<GarageAPI.KeyInfo> {
    return this.request<GarageAPI.KeyInfo>(`/v0/key?id=${id}`, {
      method: "POST",
      body: JSON.stringify(permissions),
    });
  }
}

export const apiClient = new APIClient();
```

### 任务 1.2: 创建 React Query 钩子 (3 小时)

**创建文件**:

```bash
mkdir -p src/hooks/api
touch src/hooks/api/use-cluster.ts
touch src/hooks/api/use-buckets.ts
touch src/hooks/api/use-keys.ts
```

**实现代码**:

```typescript
// src/hooks/api/use-cluster.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useClusterStatus() {
  return useQuery({
    queryKey: ["cluster", "status"],
    queryFn: () => apiClient.getClusterStatus(),
    refetchInterval: 30000, // 30秒自动刷新
  });
}

export function useClusterLayout() {
  return useQuery({
    queryKey: ["cluster", "layout"],
    queryFn: () => apiClient.getClusterLayout(),
    refetchInterval: 60000, // 1分钟自动刷新
  });
}

export function useNodes() {
  return useQuery({
    queryKey: ["cluster", "nodes"],
    queryFn: () => apiClient.getNodes(),
    refetchInterval: 30000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 10000, // 10秒检查健康状态
    retry: 1,
  });
}
```

```typescript
// src/hooks/api/use-buckets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { GarageAPI } from "@/types";
import { toast } from "sonner";

export function useBuckets() {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: () => apiClient.getBuckets(),
  });
}

export function useBucket(id: string) {
  return useQuery({
    queryKey: ["buckets", id],
    queryFn: () => apiClient.getBucket(id),
    enabled: !!id,
  });
}

export function useCreateBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GarageAPI.CreateBucketRequest) =>
      apiClient.createBucket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      toast.success("存储桶创建成功");
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });
}

export function useDeleteBucket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBucket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      toast.success("存储桶删除成功");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });
}
```

```typescript
// src/hooks/api/use-keys.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { GarageAPI } from "@/types";
import { toast } from "sonner";

export function useKeys() {
  return useQuery({
    queryKey: ["keys"],
    queryFn: () => apiClient.getKeys(),
  });
}

export function useKey(id: string) {
  return useQuery({
    queryKey: ["keys", id],
    queryFn: () => apiClient.getKey(id),
    enabled: !!id,
  });
}

export function useCreateKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GarageAPI.CreateKeyRequest) => apiClient.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
      toast.success("访问密钥创建成功");
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });
}

export function useDeleteKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
      toast.success("访问密钥删除成功");
    },
    onError: (error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });
}

export function useUpdateKeyPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: string;
      permissions: GarageAPI.KeyPermissions;
    }) => apiClient.updateKeyPermissions(id, permissions),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["keys"] });
      queryClient.invalidateQueries({ queryKey: ["keys", id] });
      toast.success("权限更新成功");
    },
    onError: (error) => {
      toast.error(`权限更新失败: ${error.message}`);
    },
  });
}
```

### 任务 1.3: 设置 React Query Provider (1 小时)

**创建文件**:

```bash
touch src/providers/query-provider.tsx
```

**实现代码**:

```typescript
// src/providers/query-provider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5分钟
            gcTime: 1000 * 60 * 10, // 10分钟
            retry: (failureCount, error) => {
              // 认证错误不重试
              if (
                error.message.includes("401") ||
                error.message.includes("403")
              ) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**更新布局文件**:

```typescript
// src/app/layout.tsx
import QueryProvider from "@/providers/query-provider";

// ...其他代码...

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <QueryProvider>
          <MainLayout>{children}</MainLayout>
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

## 📋 Day 10-11: 仪表板页面实现

### 任务 2.1: 创建仪表板页面 (4 小时)

**更新文件**:

```typescript
// src/app/page.tsx
"use client";

import { useClusterStatus, useHealth, useBuckets, useKeys } from "@/hooks/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import StatsCard from "@/components/dashboard/stats-card";
import ClusterOverview from "@/components/dashboard/cluster-overview";
import RecentActivity from "@/components/dashboard/recent-activity";
import { Server, Database, Key, Activity, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: cluster, isLoading: clusterLoading } = useClusterStatus();
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const { data: keys, isLoading: keysLoading } = useKeys();

  const isLoading =
    healthLoading || clusterLoading || bucketsLoading || keysLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载仪表板数据..." />
      </div>
    );
  }

  const healthStatus = health?.status || "unknown";
  const nodeCount = cluster?.nodes?.length || 0;
  const bucketCount = buckets?.length || 0;
  const keyCount = keys?.length || 0;

  const onlineNodes =
    cluster?.nodes?.filter(
      (node) => node.status === "online" || node.status === "up"
    ).length || 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          仪表板
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Garage 对象存储服务管理概览
        </p>
      </div>

      {/* 健康状态提醒 */}
      {healthStatus !== "ok" && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                服务状态异常
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                请检查集群健康状态和节点连接
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="集群健康状态"
          value={healthStatus === "ok" ? "正常" : "异常"}
          icon={Activity}
          trend={healthStatus === "ok" ? "up" : "down"}
          className={healthStatus === "ok" ? "text-green-600" : "text-red-600"}
        />

        <StatsCard
          title="在线节点"
          value={`${onlineNodes}/${nodeCount}`}
          subtitle={`总共 ${nodeCount} 个节点`}
          icon={Server}
          trend={
            onlineNodes === nodeCount
              ? "up"
              : onlineNodes > 0
              ? "stable"
              : "down"
          }
        />

        <StatsCard
          title="存储桶"
          value={bucketCount}
          subtitle="个存储桶"
          icon={Database}
          trend="stable"
        />

        <StatsCard
          title="访问密钥"
          value={keyCount}
          subtitle="个访问密钥"
          icon={Key}
          trend="stable"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 集群概览 */}
        <ClusterOverview cluster={cluster} />

        {/* 最近活动 */}
        <RecentActivity />
      </div>
    </div>
  );
}
```

### 任务 2.2: 创建统计卡片组件 (2 小时)

**更新文件**:

```typescript
// src/components/dashboard/stats-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "stable",
  className,
}: StatsCardProps) {
  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-gray-400",
  };

  const TrendIcon = trendIcons[trend];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p
                className={cn(
                  "text-2xl font-semibold text-gray-900 dark:text-white",
                  className
                )}
              >
                {value}
              </p>
              {subtitle && (
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <Icon className="h-8 w-8 text-gray-400" />
            <TrendIcon className={cn("h-4 w-4", trendColors[trend])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 任务 2.3: 创建集群概览组件 (3 小时)

**创建文件**:

```bash
touch src/components/dashboard/cluster-overview.tsx
```

**实现代码**:

```typescript
// src/components/dashboard/cluster-overview.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GarageAPI } from "@/types";
import { formatBytes } from "@/lib/utils";
import { Server, HardDrive, Cpu, MemoryStick } from "lucide-react";

interface ClusterOverviewProps {
  cluster?: GarageAPI.ClusterStatus;
}

export default function ClusterOverview({ cluster }: ClusterOverviewProps) {
  if (!cluster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            集群概览
          </CardTitle>
          <CardDescription>集群状态信息</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            暂无集群数据
          </p>
        </CardContent>
      </Card>
    );
  }

  const getNodeStatusBadge = (status: string) => {
    switch (status) {
      case "online":
      case "up":
        return <Badge variant="success">在线</Badge>;
      case "offline":
      case "down":
        return <Badge variant="destructive">离线</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          集群概览
        </CardTitle>
        <CardDescription>{cluster.nodes?.length || 0} 个节点</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 集群信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">集群ID</p>
              <p className="font-mono text-xs break-all">
                {cluster.clusterId || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">布局版本</p>
              <p className="font-semibold">{cluster.layoutVersion || "N/A"}</p>
            </div>
          </div>

          {/* 节点列表 */}
          {cluster.nodes && cluster.nodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                节点状态
              </h4>
              <div className="space-y-2">
                {cluster.nodes.slice(0, 5).map((node, index) => (
                  <div
                    key={node.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {node.hostname || `节点 ${index + 1}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getNodeStatusBadge(node.status || "unknown")}
                    </div>
                  </div>
                ))}

                {cluster.nodes.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    还有 {cluster.nodes.length - 5} 个节点...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 任务 2.4: 创建最近活动组件 (3 小时)

**创建文件**:

```bash
touch src/components/dashboard/recent-activity.tsx
```

**实现代码**:

```typescript
// src/components/dashboard/recent-activity.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, Trash2, Edit, Key, Database } from "lucide-react";

// 模拟数据 - 实际应用中应该从API获取
const mockActivities = [
  {
    id: "1",
    type: "bucket.created",
    title: '创建存储桶 "my-bucket"',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5分钟前
    user: "admin",
    icon: Plus,
    color: "text-green-600",
  },
  {
    id: "2",
    type: "key.created",
    title: '创建访问密钥 "app-key"',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15分钟前
    user: "admin",
    icon: Key,
    color: "text-blue-600",
  },
  {
    id: "3",
    type: "bucket.deleted",
    title: '删除存储桶 "old-bucket"',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分钟前
    user: "admin",
    icon: Trash2,
    color: "text-red-600",
  },
  {
    id: "4",
    type: "key.updated",
    title: "更新访问密钥权限",
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1小时前
    user: "admin",
    icon: Edit,
    color: "text-orange-600",
  },
];

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "刚刚";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} 小时前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} 天前`;
  }
}

function getActivityBadge(type: string) {
  if (type.includes("created")) {
    return <Badge variant="success">创建</Badge>;
  } else if (type.includes("deleted")) {
    return <Badge variant="destructive">删除</Badge>;
  } else if (type.includes("updated")) {
    return <Badge variant="warning">更新</Badge>;
  } else {
    return <Badge variant="secondary">其他</Badge>;
  }
}

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          最近活动
        </CardTitle>
        <CardDescription>系统最近的操作记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div
                  className={`p-2 rounded-full bg-white dark:bg-gray-600 ${activity.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    {getActivityBadge(activity.type)}
                  </div>

                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user}
                    </p>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {mockActivities.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                暂无最近活动记录
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            查看全部活动 →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 📋 Day 12-14: 错误处理与优化

### 任务 3.1: 创建错误边界组件 (2 小时)

**创建文件**:

```bash
touch src/components/error-boundary.tsx
```

**实现代码**:

```typescript
// src/components/error-boundary.tsx
"use client";

import { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-800 dark:text-red-200">
                出现错误
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                页面加载时出现了问题，请稍后重试。
              </p>

              {process.env.NODE_ENV === "development" && (
                <details className="text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                    错误详情
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}

              <Button
                onClick={() => window.location.reload()}
                icon={RefreshCw}
                className="w-full"
              >
                重新加载页面
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 任务 3.2: 创建加载状态组件 (2 小时)

**创建文件**:

```bash
touch src/components/ui/empty-state.tsx
```

**实现代码**:

```typescript
// src/components/ui/empty-state.tsx
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto mb-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
        {description}
      </p>

      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

### 任务 3.3: 添加格式化工具函数 (1 小时)

**更新文件**:

```typescript
// src/lib/utils.ts (添加新的工具函数)

// ...现有代码...

/**
 * 格式化字节大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "刚刚";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} 分钟前`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} 小时前`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} 天前`;
  }
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证存储桶名称
 */
export function validateBucketName(name: string): string | null {
  if (!name) return "存储桶名称不能为空";
  if (name.length < 3) return "存储桶名称至少3个字符";
  if (name.length > 63) return "存储桶名称不能超过63个字符";
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    return "存储桶名称只能包含小写字母、数字和连字符，且必须以字母或数字开头和结尾";
  }
  if (name.includes("..")) return "存储桶名称不能包含连续的连字符";
  return null;
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}
```

### 任务 3.4: 完善类型定义 (2 小时)

**更新文件**:

```typescript
// src/types/index.ts (添加更多类型定义)

// ...现有代码...

export namespace GarageAPI {
  // 健康检查响应
  export interface HealthResponse {
    status: "ok" | "degraded" | "fail";
    checks?: {
      [key: string]: {
        status: "ok" | "degraded" | "fail";
        message?: string;
      };
    };
  }

  // 集群状态
  export interface ClusterStatus {
    clusterId?: string;
    layoutVersion?: number;
    nodes?: Node[];
    knownNodes?: Node[];
  }

  // 集群布局
  export interface ClusterLayout {
    version: number;
    roles: { [nodeId: string]: NodeRole };
    stagedRoleChanges: { [nodeId: string]: NodeRole };
  }

  // 节点信息
  export interface Node {
    id: string;
    hostname?: string;
    addr?: string;
    status?: "online" | "offline" | "up" | "down";
    lastSeen?: string;
    zone?: string;
    capacity?: number;
    tags?: string[];
  }

  // 节点角色
  export interface NodeRole {
    zone: string;
    capacity?: number;
    tags?: string[];
  }

  // 存储桶信息
  export interface Bucket {
    id: string;
    globalAliases: string[];
    localAliases?: { [key: string]: string };
    websiteAccess?: boolean;
    corsRules?: CorsRule[];
    lifecycleConfiguration?: LifecycleRule[];
    quotas?: BucketQuotas;
  }

  // 存储桶详细信息
  export interface BucketInfo extends Bucket {
    keys?: KeyPermission[];
    objects?: number;
    bytes?: number;
    unfinishedUploads?: number;
  }

  // 创建存储桶请求
  export interface CreateBucketRequest {
    globalAlias?: string;
    localAlias?: {
      keyId: string;
      alias: string;
    };
  }

  // CORS 规则
  export interface CorsRule {
    id?: string;
    allowedHeaders?: string[];
    allowedMethods: string[];
    allowedOrigins: string[];
    exposeHeaders?: string[];
    maxAgeSeconds?: number;
  }

  // 生命周期规则
  export interface LifecycleRule {
    id: string;
    status: "Enabled" | "Disabled";
    filter?: {
      prefix?: string;
      tags?: { [key: string]: string };
    };
    expiration?: {
      days?: number;
      date?: string;
    };
    abortIncompleteMultipartUpload?: {
      daysAfterInitiation: number;
    };
  }

  // 存储桶配额
  export interface BucketQuotas {
    maxSize?: number;
    maxObjects?: number;
  }

  // 访问密钥信息
  export interface Key {
    accessKeyId: string;
    name?: string;
    secretAccessKey?: string;
    permissions: KeyPermissions;
  }

  // 访问密钥详细信息
  export interface KeyInfo extends Key {
    buckets?: KeyPermission[];
  }

  // 创建访问密钥请求
  export interface CreateKeyRequest {
    name?: string;
  }

  // 密钥权限
  export interface KeyPermissions {
    createBucket?: boolean;
  }

  // 密钥对存储桶的权限
  export interface KeyPermission {
    bucketId: string;
    permissions: {
      read?: boolean;
      write?: boolean;
      owner?: boolean;
    };
  }

  // API 错误响应
  export interface ErrorResponse {
    code: string;
    message: string;
    path?: string;
    timestamp?: string;
  }
}

// 表单数据类型
export interface LoginFormData {
  username: string;
  password: string;
}

export interface CreateBucketFormData {
  name: string;
  globalAlias: boolean;
  localAlias?: string;
  keyId?: string;
}

export interface CreateKeyFormData {
  name: string;
  createBucket: boolean;
}

// 应用状态类型
export interface AppState {
  sidebarCollapsed: boolean;
  currentPath: string;
  lastActivity: Date;
}

// 通知类型
export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
}

// 活动记录类型
export interface ActivityLog {
  id: string;
  type: string;
  title: string;
  description?: string;
  user: string;
  timestamp: Date;
  metadata?: { [key: string]: any };
}
```

## ✅ 第二周验收标准

### 功能验收

- [ ] 仪表板页面正常显示统计数据
- [ ] API 集成正常工作
- [ ] 集群状态实时更新
- [ ] 健康检查状态正常显示
- [ ] 统计卡片数据准确
- [ ] 集群概览信息完整
- [ ] 最近活动记录显示

### 技术验收

- [ ] React Query 缓存机制正常
- [ ] 错误处理机制完善
- [ ] 加载状态正确显示
- [ ] TypeScript 类型定义完整
- [ ] 组件复用性良好

### 性能验收

- [ ] 页面加载时间 < 2 秒
- [ ] API 请求响应时间 < 500ms
- [ ] 自动刷新机制正常
- [ ] 内存使用合理

---

_第二周结束后，我们将拥有一个功能完整的仪表板和健壮的 API 集成系统，为后续功能模块的开发提供坚实的数据基础。_
