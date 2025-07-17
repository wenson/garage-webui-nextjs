# Garage Admin API v2 代理端点

本目录包含了 Garage Admin API v2 的代理端点实现。

## 已实现的端点

### 集群管理

- `GET /api/garage/v2/GetClusterHealth` → `GET /v2/GetClusterHealth`
- `GET /api/garage/v2/GetClusterStatus` → `GET /v2/GetClusterStatus`
- `GET /api/garage/v2/GetClusterStatistics` → `GET /v2/GetClusterStatistics`

### 存储桶管理

- `GET /api/garage/v2/ListBuckets` → `GET /v2/ListBuckets`
- `GET /api/garage/v2/GetBucketInfo` → `GET /v2/GetBucketInfo`
- `POST /api/garage/v2/CreateBucket` → `POST /v2/CreateBucket`
- `POST /api/garage/v2/UpdateBucket/{id}` → `POST /v2/UpdateBucket/{id}`
- `POST /api/garage/v2/DeleteBucket/{id}` → `POST /v2/DeleteBucket/{id}`

### 访问密钥管理

- `GET /api/garage/v2/ListKeys` → `GET /v2/ListKeys`
- `GET /api/garage/v2/GetKeyInfo` → `GET /v2/GetKeyInfo`
- `POST /api/garage/v2/CreateKey` → `POST /v2/CreateKey`

### 权限管理

- `POST /api/garage/v2/AllowBucketKey` → `POST /v2/AllowBucketKey`
- `POST /api/garage/v2/DenyBucketKey` → `POST /v2/DenyBucketKey`

### 集群布局管理

- `GET /api/garage/v2/GetClusterLayout` → `GET /v2/GetClusterLayout`
- `POST /api/garage/v2/UpdateClusterLayout` → `POST /v2/UpdateClusterLayout`
- `POST /api/garage/v2/ApplyClusterLayout` → `POST /v2/ApplyClusterLayout`

## 待实现的端点

### Admin Token 管理

- `GET /api/garage/v2/ListAdminTokens`
- `GET /api/garage/v2/GetAdminTokenInfo`
- `GET /api/garage/v2/GetCurrentAdminTokenInfo`
- `POST /api/garage/v2/CreateAdminToken`
- `POST /api/garage/v2/UpdateAdminToken/{id}`
- `POST /api/garage/v2/DeleteAdminToken/{id}`

### 节点管理

- `POST /api/garage/v2/ConnectClusterNodes`
- `GET /api/garage/v2/GetNodeInfo/{node}`
- `GET /api/garage/v2/GetNodeStatistics/{node}`

### 对象检查和维护

- `GET /api/garage/v2/InspectObject`
- `POST /api/garage/v2/CleanupIncompleteUploads`

### 存储桶别名管理

- `POST /api/garage/v2/AddBucketAlias`
- `POST /api/garage/v2/RemoveBucketAlias`

### 其他布局操作

- `POST /api/garage/v2/RevertClusterLayout`
- `POST /api/garage/v2/PreviewClusterLayoutChanges`

## 使用说明

所有端点都会自动：

1. 添加正确的 `Authorization: Bearer` 头部
2. 设置正确的 `Content-Type: application/json`
3. 将请求代理到实际的 Garage Admin API
4. 使用 `handleGarageAPIResponse` 进行统一的错误处理
