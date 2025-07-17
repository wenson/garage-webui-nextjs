# Garage Web UI API 参考文档

本文档是 Garage Web UI API 集成的快速参考指南。

## 📚 文档导航

- **[Garage Admin API v2 详细规范](./docs/garage-admin-api-v2-spec.md)** - 完整的 API 文档，基于官方 OpenAPI 规范
- **[API 快速参考](./docs/API_REFERENCE_QUICK.md)** - 开发者快速参考指南
- **[本文档](#api-概述)** - 项目集成概述和示例

## API 概述

Garage Web UI 主要通过以下 API 与 Garage 服务交互：

1. **Garage Admin API v2** - 集群管理、存储桶操作、访问密钥管理
2. **S3 Compatible API** - 对象存储操作
3. **Web UI Backend API** - 认证和会话管理

## 快速开始

### 环境配置

```bash
# .env.local 示例配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3903
NEXT_PUBLIC_API_ADMIN_KEY=your_admin_token_here
JWT_SECRET=your_jwt_secret_here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
```

### API 客户端初始化

```typescript
// lib/garage-api-v2.ts
import { GarageAdminApiV2 } from "@/lib/garage-api-v2";

const garageApi = new GarageAdminApiV2({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  token: process.env.NEXT_PUBLIC_API_ADMIN_KEY!,
});
```

## 常用 API 示例

### 1. 健康状态检查

```typescript
// 获取集群健康状态
const health = await garageApi.getHealth();
console.log(`集群状态: ${health.status}`);
```

### 2. 获取存储桶列表

```typescript
// 获取所有存储桶
const buckets = await garageApi.listBuckets();
buckets.forEach((bucket) => {
  console.log(`存储桶: ${bucket.name}, 创建时间: ${bucket.createdAt}`);
});
```

### 3. 创建访问密钥

```typescript
// 创建新的访问密钥
const newKey = await garageApi.createKey({
  name: "my-app-key",
});
console.log(`访问密钥 ID: ${newKey.accessKeyId}`);
```

## 认证系统

Web UI 使用 JWT 认证系统：

```typescript
// 登录
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username, password }),
});

// 验证会话
const verifyResponse = await fetch("/api/auth/verify");
const isAuthenticated = verifyResponse.ok;
```

## 错误处理

```typescript
try {
  const buckets = await garageApi.listBuckets();
} catch (error) {
  if (error instanceof GarageApiError) {
    console.error(`API 错误: ${error.message} (状态码: ${error.statusCode})`);
  }
}
```

## 开发提示

1. **API 文档优先**: 查看 [详细 API 规范](./docs/garage-admin-api-v2-spec.md) 了解完整功能
2. **类型安全**: 使用 TypeScript 接口确保类型安全
3. **错误处理**: 实现适当的错误处理机制
4. **缓存策略**: 使用 React Query 进行数据缓存和状态管理

## 更多信息

- [Garage 官方文档](https://garagehq.deuxfleurs.fr/)
- [OpenAPI 规范](https://garagehq.deuxfleurs.fr/api/garage-admin-v2.json)
- [项目架构文档](./ARCHITECTURE.md)

      onSettled: (data, error, variables) => {
        // 重新获取数据确保一致性
        queryClient.invalidateQueries({
          queryKey: ["buckets", variables.bucketName, "objects"],
        });
      },

  });
  }

```

---

_此 API 参考文档提供了与 Garage 服务集成的完整指南，包括所有主要功能的 API 调用和 React Query 钩子实现。_
```
