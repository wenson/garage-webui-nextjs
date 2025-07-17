# Garage Admin API v2 接口文档

## 概述

Garage Admin API v2 是 Garage 分布式对象存储系统的管理接口。通过这个 API，您可以编程化地管理 Garage 集群，包括状态监控、布局配置、密钥管理、存储桶管理和维护任务。

**Base URL**: `http://localhost:3903`  
**API 版本**: v2.0.0  
**认证方式**: Bearer Token

## 认证

所有 API 请求都需要在 HTTP 头中包含 Bearer Token：

```
Authorization: Bearer <your-token>
```

## 特殊端点

### 健康检查 `GET /health`

检查集群健康状态。如果有足够的节点形成法定人数来处理请求，返回 200 OK，否则返回 503 Service Unavailable。

**响应示例**:

```
HTTP/1.1 200 OK
Garage is fully operational
```

### 指标监控 `GET /metrics`

以 Prometheus 格式返回 Garage 内部指标。

### 域名检查 `GET /check`

检查指定域名是否配置了静态网站存储桶。主要用于反向代理（如 Caddy）的按需 TLS 证书申请。

**参数**:

- `domain`: 要检查的域名

## 集群管理

### 获取集群健康状态 `GET /v2/GetClusterHealth`

返回集群的全局状态，包括已连接的节点数、健康的存储节点数和分区状态。

**响应字段**:

- `status`: 集群状态 (`healthy`/`degraded`/`unavailable`)
- `knownNodes`: 已知节点数
- `connectedNodes`: 已连接节点数
- `storageNodes`: 存储节点数
- `storageNodesOk`: 健康存储节点数
- `partitions`: 总分区数
- `partitionsQuorum`: 有法定人数的分区数
- `partitionsAllOk`: 完全正常的分区数

### 获取集群状态 `GET /v2/GetClusterStatus`

返回集群的当前状态，包括节点信息、布局配置等。

**响应字段**:

- `layoutVersion`: 当前布局版本号
- `nodes`: 节点列表，包含节点 ID、地址、状态等信息

### 获取集群统计 `GET /v2/GetClusterStatistics`

获取全局集群统计信息。

### 连接集群节点 `POST /v2/ConnectClusterNodes`

指示 Garage 节点连接到其他指定的 Garage 节点。

**请求体**:

```json
["<node_id>@<net_address>", ...]
```

## 集群布局管理

### 获取集群布局 `GET /v2/GetClusterLayout`

返回集群的当前布局配置，包括节点角色分配和待执行的变更。

**响应字段**:

- `version`: 当前布局版本
- `roles`: 当前节点角色列表
- `parameters`: 布局计算参数
- `partitionSize`: 分区大小（字节）
- `stagedRoleChanges`: 待执行的角色变更

### 更新集群布局 `POST /v2/UpdateClusterLayout`

提交集群布局的修改。这些修改将作为暂存变更，需要调用 `ApplyClusterLayout` 来应用。

**请求体**:

```json
{
  "roles": [
    {
      "id": "node-id",
      "zone": "zone-name",
      "capacity": 1000000000,
      "tags": ["storage"]
    }
  ],
  "parameters": {
    "zoneRedundancy": { "atLeast": 3 }
  }
}
```

### 预览布局变更 `POST /v2/PreviewClusterLayoutChanges`

计算新布局并返回详细统计信息，但不实际应用到集群。

### 应用集群布局 `POST /v2/ApplyClusterLayout`

将当前暂存的布局变更应用到集群。

**请求体**:

```json
{
  "version": 1
}
```

### 撤销布局变更 `POST /v2/RevertClusterLayout`

清除所有暂存的布局变更。

### 获取布局历史 `GET /v2/GetClusterLayoutHistory`

返回集群布局的历史版本信息。

### 跳过死节点 `POST /v2/ClusterLayoutSkipDeadNodes`

强制推进布局更新跟踪器，跳过无响应的节点。

## 存储桶管理

### 列出存储桶 `GET /v2/ListBuckets`

列出集群中的所有存储桶及其别名。

**响应示例**:

```json
[
  {
    "id": "bucket-uuid",
    "created": "2025-07-16T10:00:00Z",
    "globalAliases": ["my-bucket"],
    "localAliases": []
  }
]
```

### 获取存储桶信息 `GET /v2/GetBucketInfo`

获取指定存储桶的详细信息。

**查询参数**:

- `id`: 存储桶 ID
- `globalAlias`: 全局别名
- `search`: 部分 ID 或别名搜索

**响应字段**:

- `id`: 存储桶 ID
- `created`: 创建时间
- `globalAliases`: 全局别名列表
- `websiteAccess`: 是否启用网站访问
- `keys`: 有权限的访问密钥列表
- `objects`: 对象数量
- `bytes`: 总字节数
- `quotas`: 配额设置

### 创建存储桶 `POST /v2/CreateBucket`

创建新的存储桶。

**请求体**:

```json
{
  "globalAlias": "my-new-bucket",
  "localAlias": {
    "accessKeyId": "key-id",
    "alias": "local-name",
    "allow": {
      "read": true,
      "write": true,
      "owner": true
    }
  }
}
```

### 更新存储桶 `POST /v2/UpdateBucket/{id}`

更新存储桶配置，包括网站访问设置和配额。

**请求体**:

```json
{
  "websiteAccess": {
    "enabled": true,
    "indexDocument": "index.html",
    "errorDocument": "error.html"
  },
  "quotas": {
    "maxSize": 1000000000,
    "maxObjects": 10000
  }
}
```

### 删除存储桶 `POST /v2/DeleteBucket/{id}`

删除空的存储桶。注意：这会删除所有关联的别名。

### 添加存储桶别名 `POST /v2/AddBucketAlias`

为存储桶添加全局或本地别名。

**请求体**:

```json
{
  "bucketId": "bucket-id",
  "globalAlias": "new-alias"
}
```

### 移除存储桶别名 `POST /v2/RemoveBucketAlias`

移除存储桶的别名。

### 清理未完成上传 `POST /v2/CleanupIncompleteUploads`

移除指定时间之前的所有未完成的多部分上传。

**请求体**:

```json
{
  "bucketId": "bucket-id",
  "olderThanSecs": 86400
}
```

### 检查对象 `GET /v2/InspectObject`

返回对象的详细信息，包括内部状态和数据块引用。

**查询参数**:

- `bucketId`: 存储桶 ID
- `key`: 对象键

## 访问密钥管理

### 列出访问密钥 `GET /v2/ListKeys`

返回集群中的所有 API 访问密钥。

**响应示例**:

```json
[
  {
    "id": "GK123456789ABCDEF",
    "name": "my-key",
    "created": "2025-07-16T10:00:00Z",
    "expired": false
  }
]
```

### 获取密钥信息 `GET /v2/GetKeyInfo`

返回指定访问密钥的详细信息。

**查询参数**:

- `id`: 访问密钥 ID
- `search`: 部分 ID 或名称搜索
- `showSecretKey`: 是否返回密钥（默认 false）

### 创建访问密钥 `POST /v2/CreateKey`

创建新的 API 访问密钥。

**请求体**:

```json
{
  "name": "my-new-key",
  "allow": {
    "createBucket": true
  }
}
```

### 更新访问密钥 `POST /v2/UpdateKey/{id}`

更新访问密钥的信息和权限。

**请求体**:

```json
{
  "name": "updated-key-name",
  "allow": {
    "createBucket": true
  },
  "deny": {
    "createBucket": false
  },
  "expiration": "2025-12-31T23:59:59Z"
}
```

### 删除访问密钥 `POST /v2/DeleteKey/{id}`

从集群中删除访问密钥，移除其对所有存储桶的访问权限。

### 导入访问密钥 `POST /v2/ImportKey`

导入现有的 API 密钥（主要用于迁移和备份恢复）。

**请求体**:

```json
{
  "accessKeyId": "existing-key-id",
  "secretAccessKey": "existing-secret-key",
  "name": "imported-key"
}
```

## 权限管理

### 允许存储桶权限 `POST /v2/AllowBucketKey`

为访问密钥授予存储桶的读/写/所有者权限。

**请求体**:

```json
{
  "bucketId": "bucket-id",
  "accessKeyId": "key-id",
  "permissions": {
    "read": true,
    "write": true,
    "owner": false
  }
}
```

### 拒绝存储桶权限 `POST /v2/DenyBucketKey`

撤销访问密钥对存储桶的特定权限。

## 节点管理

### 获取节点信息 `GET /v2/GetNodeInfo/{node}`

返回一个或多个 Garage 节点的信息。

**路径参数**:

- `node`: 节点 ID，`*` 表示所有节点，`self` 表示当前节点

### 获取节点统计 `GET /v2/GetNodeStatistics/{node}`

获取一个或多个 Garage 节点的统计信息。

### 创建元数据快照 `POST /v2/CreateMetadataSnapshot/{node}`

指示一个或多个节点创建元数据数据库的快照。

## 后台任务管理

### 列出后台任务 `POST /v2/ListWorkers/{node}`

列出一个或多个集群节点上当前运行的后台任务。

### 获取任务信息 `POST /v2/GetWorkerInfo/{node}`

获取指定后台任务的详细信息。

### 启动修复操作 `POST /v2/LaunchRepairOperation/{node}`

在一个或多个集群节点上启动修复操作。

**请求体**:

```json
{
  "repairType": "tables" // 可选值: "tables", "blocks", "versions", "multipartUploads", "blockRefs", "blockRc", "rebalance", "aliases"
}
```

### 获取/设置任务变量 `POST /v2/GetWorkerVariable/{node}` / `POST /v2/SetWorkerVariable/{node}`

获取或设置后台任务的配置变量。

## 数据块管理

### 获取数据块信息 `POST /v2/GetBlockInfo/{node}`

获取存储在 Garage 节点上的数据块的详细信息。

### 列出数据块错误 `GET /v2/ListBlockErrors/{node}`

列出一个或多个 Garage 节点上当前处于错误状态的数据块。

### 重试数据块同步 `POST /v2/RetryBlockResync/{node}`

指示 Garage 节点重试一个或多个缺失数据块的重新同步。

### 清理数据块 `POST /v2/PurgeBlocks/{node}`

清理对一个或多个缺失数据块的引用（危险操作，会永久删除对象）。

## 管理员令牌管理

### 列出管理员令牌 `GET /v2/ListAdminTokens`

返回集群中的所有管理员 API 令牌。

### 获取令牌信息 `GET /v2/GetAdminTokenInfo`

返回指定管理员 API 令牌的信息。

### 获取当前令牌信息 `GET /v2/GetCurrentAdminTokenInfo`

返回调用 API 的管理员令牌信息。

### 创建管理员令牌 `POST /v2/CreateAdminToken`

创建新的管理员 API 令牌。

**请求体**:

```json
{
  "name": "my-admin-token",
  "scope": ["GetClusterStatus", "ListBuckets"],
  "expiration": "2025-12-31T23:59:59Z"
}
```

### 更新管理员令牌 `POST /v2/UpdateAdminToken/{id}`

更新指定管理员 API 令牌的信息。

### 删除管理员令牌 `POST /v2/DeleteAdminToken/{id}`

从集群中删除管理员 API 令牌，撤销其所有权限。

## 错误处理

API 返回标准的 HTTP 状态码：

- `200 OK`: 操作成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误
- `503 Service Unavailable`: 服务不可用

错误响应通常包含错误消息的详细信息。

## 数据类型说明

### 容量单位

- 所有容量值以字节为单位
- Garage 使用国际单位制（SI），1kB = 1000 字节

### 时间格式

- 所有时间戳使用 RFC 3339 格式
- 示例：`2025-07-16T10:30:00Z`

### 节点 ID

- 节点 ID 是 64 位十六进制字符串
- 在节点启动时自动生成

### 权限类型

- `read`: 读取权限
- `write`: 写入权限
- `owner`: 所有者权限（包括删除等管理操作）
- `createBucket`: 创建存储桶权限

## 最佳实践

1. **使用适当的权限范围**: 为管理员令牌分配最小必要权限
2. **定期备份配置**: 使用元数据快照功能
3. **监控集群健康**: 定期检查 `/v2/GetClusterHealth` 端点
4. **谨慎使用危险操作**: 如 `PurgeBlocks` 和 `DeleteBucket`
5. **设置令牌过期时间**: 避免使用永不过期的令牌

## SDK 和工具

- 官方提供 Go 和其他语言的 SDK
- 可以使用 `garage json-api` CLI 命令进行本地 API 调用
- 支持标准的 HTTP 客户端库

更多详细信息请参考：

- [HTML 规范](https://garagehq.deuxfleurs.fr/api/garage-admin-v2.html)
- [OpenAPI JSON](https://garagehq.deuxfleurs.fr/api/garage-admin-v2.json)
