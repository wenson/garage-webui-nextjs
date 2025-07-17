# Garage Admin API v2 完整规范文档

## API 概述

Garage Admin API v2 是一个用于管理 Garage 集群的完整 REST API，基于 OpenAPI 3.1.0 规范。

- **版本**: v2.0.0
- **基础 URL**: `http://localhost:3903/`
- **认证方式**: Bearer Token (`Authorization: Bearer <admin_token>`)
- **文档来源**: https://garagehq.deuxfleurs.fr/api/garage-admin-v2.json

## 特殊端点 (无需认证)

### 1. 域名检查

- **端点**: `GET /check`
- **功能**: 静态网站域名检查，检查存储桶是否配置为提供静态网站服务
- **参数**:
  - `domain` (path, required): 要检查的域名
- **响应**:
  - `200`: 域名重定向到静态网站存储桶
  - `400`: 该域名不存在静态网站存储桶

### 2. 健康检查

- **端点**: `GET /health`
- **功能**: 检查集群健康状态，返回状态码指示 Garage 是否能够处理 API 请求
- **响应**:
  - `200`: Garage 能够处理请求
  - `503`: 此 Garage 守护进程无法处理请求

### 3. Prometheus 指标

- **端点**: `GET /metrics`
- **功能**: Prometheus 指标端点，导出 Garage 守护进程指标
- **认证**: 可选 (支持 Bearer Token 或无认证)
- **响应**: `200`: Prometheus 格式的指标数据

## 集群管理

### 集群健康和状态

#### GetClusterHealth

- **端点**: `GET /v2/GetClusterHealth`
- **功能**: 返回集群全局状态、连接节点数量、健康存储节点数量和健康分区数量
- **响应格式**:

```typescript
interface GetClusterHealthResponse {
  status: "healthy" | "degraded" | "unavailable";
  knownNodes: number; // 已知节点数量
  connectedNodes: number; // 当前连接的节点数量
  storageNodes: number; // 注册的存储节点数量
  storageNodesOk: number; // 连接正常的存储节点数量
  partitions: number; // 总分区数量 (当前总是 256)
  partitionsQuorum: number; // 有写入仲裁的分区数量
  partitionsAllOk: number; // 连接到所有存储节点的分区数量
}
```

#### GetClusterStatus

- **端点**: `GET /v2/GetClusterStatus`
- **功能**: 返回集群当前状态，包括节点信息、集群布局和暂存变更
- **响应格式**:

```typescript
interface GetClusterStatusResponse {
  layoutVersion: number; // 当前集群布局版本号
  nodes: NodeResp[]; // 节点列表
}

interface NodeResp {
  id: string; // 节点完整标识符
  isUp: boolean; // 节点是否在集群中连接
  draining: boolean; // 节点是否正在排空数据
  addr?: string; // RPC 连接地址
  hostname?: string; // 节点主机名
  garageVersion?: string; // Garage 版本
  lastSeenSecsAgo?: number; // 上次联系时间(秒)
  role?: {
    // 节点角色
    zone: string;
    capacity?: number; // 容量(字节)
    tags: string[];
  };
  dataPartition?: {
    // 数据分区信息
    total: number;
    available: number;
  };
  metadataPartition?: {
    // 元数据分区信息
    total: number;
    available: number;
  };
}
```

#### GetClusterStatistics

- **端点**: `GET /v2/GetClusterStatistics`
- **功能**: 获取全局集群统计信息
- **响应格式**:

```typescript
interface GetClusterStatisticsResponse {
  freeform: string; // 自由格式统计信息，不要尝试解析
}
```

### 集群布局管理

#### GetClusterLayout

- **端点**: `GET /v2/GetClusterLayout`
- **功能**: 返回集群当前布局，包括当前配置和暂存变更
- **响应格式**:

```typescript
interface GetClusterLayoutResponse {
  version: number; // 当前布局版本号
  roles: LayoutNodeRole[]; // 当前角色列表
  parameters: LayoutParameters; // 布局计算参数
  partitionSize: number; // 分区大小(字节)
  stagedRoleChanges: NodeRoleChange[]; // 暂存的角色变更
  stagedParameters?: LayoutParameters; // 暂存的布局参数
}
```

#### UpdateClusterLayout

- **端点**: `POST /v2/UpdateClusterLayout`
- **功能**: 向集群布局发送修改，这些修改将包含在暂存角色变更中
- **请求参数**:

```typescript
interface UpdateClusterLayoutRequest {
  roles?: NodeRoleChange[]; // 要分配或移除的新节点角色
  parameters?: LayoutParameters; // 新的布局计算参数
}

interface NodeRoleChange {
  id: string; // 节点ID
  remove?: boolean; // 设置为 true 移除节点
  zone?: string; // 区域名称
  capacity?: number | null; // 容量(字节)，null 表示网关节点
  tags?: string[]; // 标签列表
}
```

#### ApplyClusterLayout

- **端点**: `POST /v2/ApplyClusterLayout`
- **功能**: 将当前注册的暂存布局变更应用到集群
- **请求参数**:

```typescript
interface ApplyClusterLayoutRequest {
  version: number; // 作为安全措施，必须指定新的布局版本号
}
```

#### RevertClusterLayout

- **端点**: `POST /v2/RevertClusterLayout`
- **功能**: 清除暂存的布局变更
- **方法**: POST
- **响应**: 返回更新后的集群布局

#### PreviewClusterLayoutChanges

- **端点**: `POST /v2/PreviewClusterLayoutChanges`
- **功能**: 计算考虑暂存参数的新布局并返回详细统计信息，不应用到集群
- **方法**: POST
- **响应**: 新布局信息或错误消息

#### GetClusterLayoutHistory

- **端点**: `GET /v2/GetClusterLayoutHistory`
- **功能**: 返回集群中的布局历史
- **响应格式**:

```typescript
interface GetClusterLayoutHistoryResponse {
  currentVersion: number; // 当前集群布局版本号
  minAck: number; // 所有节点都知道的布局版本号
  versions: ClusterLayoutVersion[]; // 布局版本历史
  updateTrackers?: Record<string, NodeUpdateTrackers>; // 节点更新跟踪器
}
```

### 节点管理

#### ConnectClusterNodes

- **端点**: `POST /v2/ConnectClusterNodes`
- **功能**: 指示此 Garage 节点连接到指定的其他 Garage 节点
- **请求参数**: `string[]` - 节点地址数组，格式 `<node_id>@<net_address>`
- **响应**: 连接结果数组

#### GetNodeInfo

- **端点**: `GET /v2/GetNodeInfo/{node}`
- **功能**: 返回一个或多个节点上运行的 Garage 守护进程信息
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点

#### GetNodeStatistics

- **端点**: `GET /v2/GetNodeStatistics/{node}`
- **功能**: 获取一个或多个 Garage 节点的统计信息
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点

## 存储桶管理

### 存储桶 CRUD 操作

#### ListBuckets

- **端点**: `GET /v2/ListBuckets`
- **功能**: 列出集群上所有存储桶及其 UUID、全局和本地别名
- **响应格式**:

```typescript
interface ListBucketsResponse {
  id: string; // 存储桶ID
  created: string; // 创建时间 (RFC 3339)
  globalAliases: string[]; // 全局别名列表
  localAliases: BucketLocalAlias[]; // 本地别名列表
}
[];
```

#### GetBucketInfo

- **端点**: `GET /v2/GetBucketInfo`
- **功能**: 根据存储桶标识符或全局别名获取存储桶信息
- **查询参数**:
  - `id` (可选): 要查找的确切存储桶 ID
  - `globalAlias` (可选): 要查找的存储桶全局别名
  - `search` (可选): 要搜索的部分 ID 或别名
- **响应格式**:

```typescript
interface GetBucketInfoResponse {
  id: string; // 存储桶标识符
  created: string; // 创建日期 (RFC 3339)
  globalAliases: string[]; // 全局别名列表
  websiteAccess: boolean; // 是否启用网站访问
  websiteConfig?: {
    // 网站配置
    indexDocument: string;
    errorDocument?: string;
  };
  quotas: {
    // 配额设置
    maxSize?: number;
    maxObjects?: number;
  };
  keys: GetBucketInfoKey[]; // 有权限的访问密钥
  objects: number; // 对象数量
  bytes: number; // 总字节数
  unfinishedUploads: number; // 未完成上传数量
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
}
```

#### CreateBucket

- **端点**: `POST /v2/CreateBucket`
- **功能**: 创建新存储桶，可以使用全局别名、本地别名或无别名
- **请求参数**:

```typescript
interface CreateBucketRequest {
  globalAlias?: string | null; // 全局别名
  localAlias?: {
    // 本地别名
    accessKeyId: string;
    alias: string;
    allow?: ApiBucketKeyPerm; // 权限设置
  } | null;
}
```

#### UpdateBucket

- **端点**: `POST /v2/UpdateBucket/{id}`
- **功能**: 更新存储桶配置
- **路径参数**:
  - `id`: 要更新的存储桶 ID
- **请求参数**:

```typescript
interface UpdateBucketRequestBody {
  websiteAccess?: {
    enabled: boolean;
    indexDocument?: string | null;
    errorDocument?: string | null;
  } | null;
  quotas?: {
    maxSize?: number | null;
    maxObjects?: number | null;
  } | null;
}
```

#### DeleteBucket

- **端点**: `POST /v2/DeleteBucket/{id}`
- **功能**: 删除存储桶。存储桶必须为空才能删除
- **路径参数**:
  - `id`: 要删除的存储桶 ID
- **响应**:
  - `200`: 存储桶已删除
  - `400`: 存储桶不为空
  - `404`: 存储桶未找到

### 存储桶别名管理

#### AddBucketAlias

- **端点**: `POST /v2/AddBucketAlias`
- **功能**: 为目标存储桶添加别名，可以是全局或本地别名
- **请求参数**:

```typescript
interface AddBucketAliasRequest {
  bucketId: string;
  // 全局别名
  globalAlias?: string;
  // 或本地别名
  accessKeyId?: string;
  localAlias?: string;
}
```

#### RemoveBucketAlias

- **端点**: `POST /v2/RemoveBucketAlias`
- **功能**: 移除目标存储桶的别名
- **请求参数**: 与 AddBucketAlias 相同格式

### 存储桶维护

#### CleanupIncompleteUploads

- **端点**: `POST /v2/CleanupIncompleteUploads`
- **功能**: 移除所有超过指定秒数的未完成多部分上传
- **请求参数**:

```typescript
interface CleanupIncompleteUploadsRequest {
  bucketId: string; // 存储桶ID
  olderThanSecs: number; // 超过多少秒的上传被清理
}
```

#### InspectObject

- **端点**: `GET /v2/InspectObject`
- **功能**: 返回存储桶中对象的详细信息，包括在 Garage 中的内部状态
- **查询参数**:
  - `bucketId` (required): 存储桶 ID
  - `key` (required): 对象键名

## 访问密钥管理

### 密钥 CRUD 操作

#### ListKeys

- **端点**: `GET /v2/ListKeys`
- **功能**: 返回集群中所有 API 访问密钥
- **响应格式**:

```typescript
interface ListKeysResponse {
  id: string; // 访问密钥ID (AWS_ACCESS_KEY_ID)
  name: string; // 人类友好的名称
  expired: boolean; // 是否已过期
  created?: string; // 创建时间
  expiration?: string; // 过期时间
}
[];
```

#### GetKeyInfo

- **端点**: `GET /v2/GetKeyInfo`
- **功能**: 返回特定密钥的信息，包括标识符、权限和存储桶权限
- **查询参数**:
  - `id` (可选): 访问密钥 ID
  - `search` (可选): 要搜索的部分密钥 ID 或名称
  - `showSecretKey` (可选): 是否返回密钥（默认不返回）
- **响应格式**:

```typescript
interface GetKeyInfoResponse {
  accessKeyId: string;
  name: string;
  expired: boolean;
  created?: string;
  expiration?: string;
  permissions: {
    createBucket?: boolean;
  };
  buckets: KeyInfoBucketResponse[];
  secretAccessKey?: string | null; // 仅在 showSecretKey=true 时返回
}
```

#### CreateKey

- **端点**: `POST /v2/CreateKey`
- **功能**: 创建新的 API 访问密钥
- **请求参数**:

```typescript
interface CreateKeyRequest {
  name?: string | null; // 密钥名称
  expiration?: string | null; // 过期时间 (RFC 3339)
  neverExpires?: boolean; // 设置密钥永不过期
  allow?: {
    // 允许的权限
    createBucket?: boolean;
  } | null;
  deny?: {
    // 拒绝的权限
    createBucket?: boolean;
  } | null;
}
```

#### UpdateKey

- **端点**: `POST /v2/UpdateKey/{id}`
- **功能**: 更新指定的 API 访问密钥信息
- **路径参数**:
  - `id`: 访问密钥 ID
- **请求参数**: 与 CreateKey 相同格式

#### DeleteKey

- **端点**: `POST /v2/DeleteKey/{id}`
- **功能**: 从集群中删除密钥，将从所有存储桶中移除其访问权限
- **路径参数**:
  - `id`: 访问密钥 ID

#### ImportKey

- **端点**: `POST /v2/ImportKey`
- **功能**: 导入现有的 API 密钥（仅用于迁移和备份恢复）
- **请求参数**:

```typescript
interface ImportKeyRequest {
  accessKeyId: string;
  secretAccessKey: string;
  name?: string | null;
}
```

### 权限管理

#### AllowBucketKey

- **端点**: `POST /v2/AllowBucketKey`
- **功能**: 允许密钥对存储桶执行读/写/所有者操作
- **注意**: 权限中值为 true 的标志将被激活，其他标志保持不变
- **请求参数**:

```typescript
interface AllowBucketKeyRequest {
  bucketId: string;
  accessKeyId: string;
  permissions: {
    owner?: boolean;
    read?: boolean;
    write?: boolean;
  };
}
```

#### DenyBucketKey

- **端点**: `POST /v2/DenyBucketKey`
- **功能**: 拒绝密钥对存储桶执行读/写/所有者操作
- **注意**: 权限中值为 true 的标志将被停用，其他标志保持不变
- **请求参数**: 与 AllowBucketKey 相同格式

## Admin Token 管理

### Token CRUD 操作

#### ListAdminTokens

- **端点**: `GET /v2/ListAdminTokens`
- **功能**: 返回集群中所有 admin API token

#### GetAdminTokenInfo

- **端点**: `GET /v2/GetAdminTokenInfo`
- **功能**: 返回特定 admin API token 的信息
- **查询参数**:
  - `id` (可选): Admin API token ID
  - `search` (可选): 要搜索的部分 token ID 或名称

#### GetCurrentAdminTokenInfo

- **端点**: `GET /v2/GetCurrentAdminTokenInfo`
- **功能**: 返回当前调用的 admin API token 信息

#### CreateAdminToken

- **端点**: `POST /v2/CreateAdminToken`
- **功能**: 创建新的 admin API token
- **请求参数**:

```typescript
interface CreateAdminTokenRequest {
  name?: string | null;
  expiration?: string | null; // RFC 3339 格式
  neverExpires?: boolean;
  scope?: string[] | null; // 端点名称数组或 "*" 表示所有端点
}
```

#### UpdateAdminToken

- **端点**: `POST /v2/UpdateAdminToken/{id}`
- **功能**: 更新指定的 admin API token 信息
- **路径参数**:
  - `id`: Admin API token ID

#### DeleteAdminToken

- **端点**: `POST /v2/DeleteAdminToken/{id}`
- **功能**: 从集群中删除 admin API token，撤销其所有权限
- **路径参数**:
  - `id`: Admin API token ID

## 维护操作

### 节点维护

#### LaunchRepairOperation

- **端点**: `POST /v2/LaunchRepairOperation/{node}`
- **功能**: 在一个或多个集群节点上启动修复操作
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface LaunchRepairOperationRequest {
  repairType:
    | "tables"
    | "blocks"
    | "versions"
    | "multipartUploads"
    | "blockRefs"
    | "blockRc"
    | "rebalance"
    | "aliases"
    | { scrub: "start" | "pause" | "resume" | "cancel" };
}
```

#### CreateMetadataSnapshot

- **端点**: `POST /v2/CreateMetadataSnapshot/{node}`
- **功能**: 指示一个或多个节点创建其元数据数据库的快照
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点

### 数据块管理

#### GetBlockInfo

- **端点**: `POST /v2/GetBlockInfo/{node}`
- **功能**: 获取存储在 Garage 节点上的数据块详细信息
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface GetBlockInfoRequest {
  blockHash: string;
}
```

#### ListBlockErrors

- **端点**: `GET /v2/ListBlockErrors/{node}`
- **功能**: 列出当前在一个或多个 Garage 节点上处于错误状态的数据块
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点

#### PurgeBlocks

- **端点**: `POST /v2/PurgeBlocks/{node}`
- **功能**: 清除对一个或多个缺失数据块的引用（永久删除相关对象）
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**: `string[]` - 块哈希数组

#### RetryBlockResync

- **端点**: `POST /v2/RetryBlockResync/{node}`
- **功能**: 指示 Garage 节点重试一个或多个缺失数据块的重新同步
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface RetryBlockResyncRequest {
  all?: boolean; // 重试所有块
  blockHashes?: string[]; // 或指定块哈希数组
}
```

### 工作器管理

#### ListWorkers

- **端点**: `POST /v2/ListWorkers/{node}`
- **功能**: 列出当前在一个或多个集群节点上运行的后台工作器
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface ListWorkersRequest {
  busyOnly?: boolean; // 仅显示忙碌的工作器
  errorOnly?: boolean; // 仅显示有错误的工作器
}
```

#### GetWorkerInfo

- **端点**: `POST /v2/GetWorkerInfo/{node}`
- **功能**: 获取指定后台工作器的信息
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface GetWorkerInfoRequest {
  id: number; // 工作器ID
}
```

#### GetWorkerVariable

- **端点**: `POST /v2/GetWorkerVariable/{node}`
- **功能**: 从一个或多个集群节点获取一个或多个工作器变量的值
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface GetWorkerVariableRequest {
  variable?: string | null; // 变量名，null 表示获取所有变量
}
```

#### SetWorkerVariable

- **端点**: `POST /v2/SetWorkerVariable/{node}`
- **功能**: 在一个或多个集群节点上设置工作器变量的值
- **路径参数**:
  - `node`: 节点 ID，或 `*` 表示所有节点，或 `self` 表示响应节点
- **请求参数**:

```typescript
interface SetWorkerVariableRequest {
  variable: string; // 变量名
  value: string; // 变量值
}
```

## 高级布局操作

#### ClusterLayoutSkipDeadNodes

- **端点**: `POST /v2/ClusterLayoutSkipDeadNodes`
- **功能**: 强制推进布局更新跟踪器
- **请求参数**:

```typescript
interface ClusterLayoutSkipDeadNodesRequest {
  version: number; // 要假定为当前最新的布局版本号
  allowMissingData: boolean; // 即使无法为剩余节点找到数据仲裁也允许跳过
}
```

## 错误处理

所有 API 端点遵循标准 HTTP 状态码：

- **200**: 成功
- **400**: 请求参数错误
- **401**: 认证失败
- **404**: 资源未找到
- **500**: 内部服务器错误

## 数据类型定义

### 通用权限类型

```typescript
interface ApiBucketKeyPerm {
  owner?: boolean;
  read?: boolean;
  write?: boolean;
}

interface KeyPerm {
  createBucket?: boolean;
}
```

### 配额类型

```typescript
interface ApiBucketQuotas {
  maxObjects?: number | null;
  maxSize?: number | null;
}
```

### 响应包装器

对于多节点操作，API 返回 `MultiResponse` 格式：

```typescript
interface MultiResponse<T> {
  success: Record<string, T>; // 成功响应的节点映射
  error: Record<string, string>; // 错误消息的节点映射
}
```

## 实现注意事项

1. **认证**: 所有 v2 端点(除特殊端点外)都需要 Bearer Token 认证
2. **版本控制**: API 使用严格的版本控制，布局操作需要版本号验证
3. **容量单位**: 所有容量值以字节为单位 (1kB = 1000 bytes)
4. **时间格式**: 所有时间戳使用 RFC 3339 格式
5. **节点标识**: 节点可以用具体 ID、`*`(所有节点)或`self`(当前节点)标识
6. **权限语义**: AllowBucketKey 和 DenyBucketKey 有特殊的语义，只影响指定为 true 的权限
7. **布局计算**: 容量设置为 null 将节点配置为网关节点
8. **删除约束**: 存储桶必须为空才能删除
9. **多响应**: 多节点操作返回成功和错误的分离映射

## 迁移指南

从 v1 API 迁移到 v2 时注意：

1. 端点路径前缀从 `/v1/` 改为 `/v2/`
2. 操作名称使用 PascalCase (如 `GetBucketInfo`)
3. 数据结构更加规范化
4. 增强的错误处理和响应格式
5. 新增的高级功能如工作器管理、块操作等
