# Garage Admin API v2 开发参考

## 基础信息

- **Base URL**: `http://localhost:3903/`
- **认证**: `Authorization: Bearer <admin_token>`
- **内容类型**: `application/json`

## 快速参考

### 特殊端点 (无认证)

```http
GET /check?domain={domain}              # 域名检查
GET /health                             # 健康检查
GET /metrics                            # Prometheus 指标
```

### 集群管理

```http
GET /v2/GetClusterHealth                # 集群健康状态
GET /v2/GetClusterStatus                # 集群状态详情
GET /v2/GetClusterStatistics            # 集群统计信息
GET /v2/GetClusterLayout                # 当前集群布局
GET /v2/GetClusterLayoutHistory         # 布局历史
POST /v2/UpdateClusterLayout            # 更新集群布局
POST /v2/ApplyClusterLayout             # 应用布局变更
POST /v2/RevertClusterLayout            # 回滚布局变更
POST /v2/PreviewClusterLayoutChanges    # 预览布局变更
POST /v2/ClusterLayoutSkipDeadNodes     # 跳过死节点
```

### 节点管理

```http
POST /v2/ConnectClusterNodes            # 连接集群节点
GET /v2/GetNodeInfo/{node}              # 节点信息
GET /v2/GetNodeStatistics/{node}        # 节点统计
```

### 存储桶管理

```http
GET /v2/ListBuckets                     # 列出所有存储桶
GET /v2/GetBucketInfo                   # 获取存储桶信息
POST /v2/CreateBucket                   # 创建存储桶
POST /v2/UpdateBucket/{id}              # 更新存储桶
POST /v2/DeleteBucket/{id}              # 删除存储桶
POST /v2/AddBucketAlias                 # 添加存储桶别名
POST /v2/RemoveBucketAlias              # 移除存储桶别名
POST /v2/CleanupIncompleteUploads       # 清理未完成上传
GET /v2/InspectObject                   # 检查对象详情
```

### 访问密钥管理

```http
GET /v2/ListKeys                        # 列出所有访问密钥
GET /v2/GetKeyInfo                      # 获取密钥信息
POST /v2/CreateKey                      # 创建访问密钥
POST /v2/UpdateKey/{id}                 # 更新访问密钥
POST /v2/DeleteKey/{id}                 # 删除访问密钥
POST /v2/ImportKey                      # 导入访问密钥
POST /v2/AllowBucketKey                 # 授予存储桶权限
POST /v2/DenyBucketKey                  # 撤销存储桶权限
```

### Admin Token 管理

```http
GET /v2/ListAdminTokens                 # 列出所有 Token
GET /v2/GetAdminTokenInfo               # 获取 Token 信息
GET /v2/GetCurrentAdminTokenInfo        # 获取当前 Token 信息
POST /v2/CreateAdminToken               # 创建 Token
POST /v2/UpdateAdminToken/{id}          # 更新 Token
POST /v2/DeleteAdminToken/{id}          # 删除 Token
```

### 维护操作

```http
POST /v2/LaunchRepairOperation/{node}   # 启动修复操作
POST /v2/CreateMetadataSnapshot/{node}  # 创建元数据快照
POST /v2/GetBlockInfo/{node}            # 获取数据块信息
GET /v2/ListBlockErrors/{node}          # 列出错误数据块
POST /v2/PurgeBlocks/{node}             # 清除数据块
POST /v2/RetryBlockResync/{node}        # 重试数据块同步
```

### 工作器管理

```http
POST /v2/ListWorkers/{node}             # 列出工作器
POST /v2/GetWorkerInfo/{node}           # 获取工作器信息
POST /v2/GetWorkerVariable/{node}       # 获取工作器变量
POST /v2/SetWorkerVariable/{node}       # 设置工作器变量
```

## 常用查询参数

### GetBucketInfo

```
?id=bucket_id                           # 按ID查找
?globalAlias=alias_name                 # 按全局别名查找
?search=partial_name                    # 模糊搜索
```

### GetKeyInfo

```
?id=key_id                              # 按ID查找
?search=partial_name                    # 模糊搜索
?showSecretKey=true                     # 显示密钥
```

### GetAdminTokenInfo

```
?id=token_id                            # 按ID查找
?search=partial_name                    # 模糊搜索
```

### InspectObject

```
?bucketId=bucket_id&key=object_key      # 检查指定对象
```

## 路径参数说明

### {node} 参数

- 具体节点 ID: `a1b2c3d4...`
- 所有节点: `*`
- 当前节点: `self`

### {id} 参数

- 存储桶 ID、访问密钥 ID 或 Token ID

## 常用请求体示例

### 创建存储桶

```json
{
  "globalAlias": "my-bucket",
  "localAlias": {
    "accessKeyId": "key123",
    "alias": "local-bucket",
    "allow": {
      "read": true,
      "write": true,
      "owner": false
    }
  }
}
```

### 创建访问密钥

```json
{
  "name": "my-api-key",
  "expiration": "2024-12-31T23:59:59Z",
  "allow": {
    "createBucket": true
  }
}
```

### 更新存储桶

```json
{
  "websiteAccess": {
    "enabled": true,
    "indexDocument": "index.html",
    "errorDocument": "error.html"
  },
  "quotas": {
    "maxSize": 1073741824,
    "maxObjects": 1000
  }
}
```

### 授予存储桶权限

```json
{
  "bucketId": "bucket123",
  "accessKeyId": "key456",
  "permissions": {
    "read": true,
    "write": true,
    "owner": false
  }
}
```

### 更新集群布局

```json
{
  "roles": [
    {
      "id": "node123",
      "zone": "zone1",
      "capacity": 107374182400,
      "tags": ["ssd", "fast"]
    },
    {
      "id": "node456",
      "remove": true
    }
  ],
  "parameters": {
    "zoneRedundancy": {
      "atLeast": 3
    }
  }
}
```

### 应用布局变更

```json
{
  "version": 42
}
```

### 清理未完成上传

```json
{
  "bucketId": "bucket123",
  "olderThanSecs": 86400
}
```

### 启动修复操作

```json
{
  "repairType": "blocks"
}
```

## 常用响应格式

### 集群健康状态

```json
{
  "status": "healthy",
  "knownNodes": 3,
  "connectedNodes": 3,
  "storageNodes": 3,
  "storageNodesOk": 3,
  "partitions": 256,
  "partitionsQuorum": 256,
  "partitionsAllOk": 256
}
```

### 存储桶信息

```json
{
  "id": "bucket123",
  "created": "2024-01-01T00:00:00Z",
  "globalAliases": ["my-bucket"],
  "websiteAccess": false,
  "quotas": {
    "maxSize": null,
    "maxObjects": null
  },
  "keys": [
    {
      "accessKeyId": "key123",
      "name": "my-key",
      "permissions": {
        "owner": true,
        "read": true,
        "write": true
      },
      "bucketLocalAliases": ["local-bucket"]
    }
  ],
  "objects": 42,
  "bytes": 1048576,
  "unfinishedUploads": 0,
  "unfinishedMultipartUploads": 0,
  "unfinishedMultipartUploadParts": 0,
  "unfinishedMultipartUploadBytes": 0
}
```

### 访问密钥信息

```json
{
  "accessKeyId": "key123",
  "name": "my-api-key",
  "expired": false,
  "created": "2024-01-01T00:00:00Z",
  "expiration": null,
  "permissions": {
    "createBucket": true
  },
  "buckets": [
    {
      "id": "bucket123",
      "globalAliases": ["my-bucket"],
      "localAliases": ["local-bucket"],
      "permissions": {
        "owner": true,
        "read": true,
        "write": true
      }
    }
  ],
  "secretAccessKey": "secret123..."
}
```

## 错误响应

```json
{
  "error": "详细错误消息",
  "code": "ERROR_CODE"
}
```

## 多节点响应格式

```json
{
  "success": {
    "node1": {
      /* 成功响应数据 */
    },
    "node2": {
      /* 成功响应数据 */
    }
  },
  "error": {
    "node3": "连接失败",
    "node4": "操作超时"
  }
}
```

## 开发提示

1. **认证**: 除特殊端点外，所有请求都需要 Bearer Token
2. **容量单位**: 所有容量值使用字节 (1kB = 1000 bytes)
3. **时间格式**: 使用 RFC 3339 格式 (ISO 8601)
4. **权限语义**: AllowBucketKey 只激活设为 true 的权限，其他保持不变
5. **布局版本**: 布局操作需要正确的版本号作为安全措施
6. **节点参数**: 使用 `*` 对所有节点操作，`self` 对当前节点操作
7. **删除限制**: 存储桶必须为空才能删除
8. **导入限制**: ImportKey 仅用于迁移和备份恢复

## 环境变量

```bash
# 在 .env.local 中设置
GARAGE_API_BASE_URL=http://localhost:3903
GARAGE_API_ADMIN_KEY=your-admin-token-here
```

## 测试命令示例

```bash
# 获取集群健康状态
curl -H "Authorization: Bearer $GARAGE_API_ADMIN_KEY" \
     http://localhost:3903/v2/GetClusterHealth

# 列出存储桶
curl -H "Authorization: Bearer $GARAGE_API_ADMIN_KEY" \
     http://localhost:3903/v2/ListBuckets

# 创建访问密钥
curl -X POST \
     -H "Authorization: Bearer $GARAGE_API_ADMIN_KEY" \
     -H "Content-Type: application/json" \
     -d '{"name": "test-key", "allow": {"createBucket": true}}' \
     http://localhost:3903/v2/CreateKey
```
