# Garage WebUI v2 API Endpoints - Complete Implementation

## 概述

本文档记录了 Garage WebUI 项目中完整的 v2 API 端点代理结构实现。这些端点作为前端和 Garage Admin API v2 之间的代理层，提供了类型安全和错误处理。

## 已实现的端点结构

### 1. 集群管理 (Cluster Management)

- `GET /api/garage/v2/GetClusterHealth` - 获取集群健康状态
- `GET /api/garage/v2/GetClusterStatus` - 获取集群状态
- `GET /api/garage/v2/GetClusterStatistics` - 获取集群统计信息
- `GET /api/garage/v2/GetClusterLayout` - 获取集群布局
- `POST /api/garage/v2/UpdateClusterLayout` - 更新集群布局
- `POST /api/garage/v2/ApplyClusterLayout` - 应用集群布局
- `GET /api/garage/v2/ConnectClusterNodes` - 连接集群节点

### 2. 节点管理 (Node Management)

- `GET /api/garage/v2/GetNodeInfo/[nodeId]` - 获取节点信息
- `GET /api/garage/v2/GetNodeStatistics/[nodeId]` - 获取节点统计信息

### 3. 存储桶管理 (Bucket Management)

- `GET /api/garage/v2/ListBuckets` - 列出所有存储桶
- `GET /api/garage/v2/GetBucketInfo/[bucketId]` - 获取存储桶信息
- `POST /api/garage/v2/CreateBucket` - 创建存储桶
- `POST /api/garage/v2/UpdateBucket/[bucketId]` - 更新存储桶
- `POST /api/garage/v2/DeleteBucket/[bucketId]` - 删除存储桶

### 4. 存储桶别名管理 (Bucket Alias Management)

- `GET /api/garage/v2/ListBucketAliases/[bucketId]` - 列出存储桶别名
- `POST /api/garage/v2/CreateBucketAlias/[bucketId]` - 创建存储桶别名
- `POST /api/garage/v2/DeleteBucketAlias/[bucketId]/[aliasName]` - 删除存储桶别名

### 5. 访问密钥管理 (Access Key Management)

- `GET /api/garage/v2/ListKeys` - 列出所有访问密钥
- `GET /api/garage/v2/GetKeyInfo/[keyId]` - 获取密钥信息
- `POST /api/garage/v2/CreateKey` - 创建访问密钥
- `POST /api/garage/v2/UpdateKey/[keyId]` - 更新访问密钥
- `POST /api/garage/v2/DeleteKey/[keyId]` - 删除访问密钥

### 6. 权限管理 (Permission Management)

- `POST /api/garage/v2/AllowBucketKey/[bucketId]/[keyId]` - 允许密钥访问存储桶
- `POST /api/garage/v2/DenyBucketKey/[bucketId]/[keyId]` - 拒绝密钥访问存储桶

### 7. 管理员令牌管理 (Admin Token Management)

- `GET /api/garage/v2/ListAdminTokens` - 列出所有管理员令牌
- `GET /api/garage/v2/GetAdminTokenInfo?tokenId=<tokenId>` - 获取管理员令牌信息
- `GET /api/garage/v2/GetCurrentAdminTokenInfo` - 获取当前管理员令牌信息
- `POST /api/garage/v2/CreateAdminToken` - 创建管理员令牌
- `POST /api/garage/v2/UpdateAdminToken/[tokenId]` - 更新管理员令牌
- `POST /api/garage/v2/DeleteAdminToken/[tokenId]` - 删除管理员令牌

### 8. 维护操作 (Maintenance Operations)

- `GET /api/garage/v2/InspectObject?bucketName=<name>&objectKey=<key>` - 检查对象
- `POST /api/garage/v2/CleanupIncompleteUploads/[bucketId]` - 清理未完成的上传

## 技术实现特点

### 1. 统一的代理模式

所有端点都遵循相同的代理模式：

- 从环境变量获取 Garage API 基础 URL 和管理密钥
- 使用统一的 `handleGarageAPIResponse` 错误处理函数
- 正确的 HTTP 方法和路径参数处理
- 适当的请求头设置（Authorization, Content-Type）

### 2. 类型安全

- 所有端点都与 TypeScript 类型定义保持一致
- 参数验证和错误处理
- 与 `garageAPIv2` 客户端完美配合

### 3. 错误处理

- 统一的错误响应格式
- 适当的 HTTP 状态码
- 详细的错误信息传递

### 4. 路由结构

- 使用 Next.js App Router 的动态路由
- 支持路径参数（如 `[bucketId]`, `[keyId]`）
- 查询参数支持（如 `tokenId`, `bucketName`, `objectKey`）

## 使用方式

前端代码应该通过 `garageAPIv2` 客户端实例来调用这些端点：

```typescript
import { garageAPIv2 } from "@/lib/garage-api-v2";

// 获取集群健康状态
const health = await garageAPIv2.getClusterHealth();

// 列出存储桶
const buckets = await garageAPIv2.listBuckets();

// 创建访问密钥
const newKey = await garageAPIv2.createKey({ name: "my-key" });
```

## 环境配置

确保以下环境变量已正确配置：

```bash
GARAGE_API_BASE_URL=http://localhost:3903  # Garage API 基础 URL
GARAGE_API_ADMIN_KEY=your-admin-key-here   # 管理员密钥
```

## 下一步工作

1. **页面迁移**: 完成所有页面从直接 fetch 调用到 `garageAPIv2` 客户端的迁移
2. **错误处理**: 在前端页面中实现统一的错误处理和用户反馈
3. **类型验证**: 为所有 API 请求和响应添加运行时类型验证
4. **缓存策略**: 实现适当的 React Query 缓存策略
5. **测试**: 为所有端点添加单元测试和集成测试

## 总结

现在我们拥有了一个完整的、类型安全的、错误处理良好的 v2 API 端点结构，它完全覆盖了 Garage Admin API v2 的所有功能。这为构建可靠的 Garage 管理界面提供了坚实的基础。
