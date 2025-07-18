# S3 集成配置指南

## 📋 概述

本文档说明如何配置 Garage WebUI 与 S3 API 的集成，包括认证配置、密钥管理和上传功能。

## 🔑 核心概念

**重要**: 界面上显示的"访问密钥"就是用于 S3 API 认证的密钥！

## 🚀 智能 S3 认证系统

### 自动化配置（推荐）

从当前版本开始，系统会自动使用当前桶有权限的密钥进行上传，无需手动配置！

#### 工作原理

1. **前端智能选择**: 上传时自动选择当前桶有写入权限的密钥
2. **自动传递**: 将选中的密钥 ID 和 Secret 传递给后端
3. **后端认证**: 使用传递的密钥进行 S3 认证
4. **降级策略**: 如果没有合适的密钥，回退到环境变量配置

#### 使用步骤

1. 确保桶有关联的写入密钥（在桶管理页面设置）
2. 直接在界面上上传文件
3. 系统自动选择合适的密钥进行认证

## 🔧 手动配置（可选）

如果需要手动配置 S3 认证，请按照以下步骤：

### 1. 获取访问密钥

#### 从界面获取

1. 访问 `/keys` 页面
2. 找到你想用于上传的密钥（建议有写入权限的密钥）
3. 点击 **Access Key ID** 旁边的复制按钮 📋
4. 点击 **Secret Access Key** 旁边的眼睛按钮 👁️ 显示密钥，然后复制 📋

#### 通过 API 创建新密钥

```bash
# 创建新的访问密钥
curl -X POST "http://localhost:3903/v2/CreateKey" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "webui-upload-key"
  }'
```

#### 列出现有密钥

```bash
# 列出所有密钥
curl -X GET "http://localhost:3903/v2/ListKeys" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. 配置环境变量

在 `.env.local` 文件中添加以下配置：

```bash
# Garage S3 API 认证
GARAGE_S3_ACCESS_KEY_ID=your_access_key_id
GARAGE_S3_SECRET_ACCESS_KEY=your_secret_access_key

# S3 端点 URL
NEXT_PUBLIC_S3_ENDPOINT_URL=http://localhost:3900
```

### 3. 验证配置

重启开发服务器并查看控制台日志：

- ✅ `"使用 S3 认证上传"` - 配置正确
- ❌ `"警告：使用无认证模式上传"` - 配置缺失

## 🔐 权限管理

### 必需权限

确保选择的密钥具有：

- **对目标存储桶的写入权限**
- 密钥没有过期（界面会显示是否过期）

### 设置桶权限

```bash
# 允许密钥访问存储桶
curl -X POST "http://localhost:3903/v2/AllowBucketKey" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bucketId": "your-bucket-id",
    "accessKeyId": "your_access_key_id",
    "permissions": {
      "read": true,
      "write": true,
      "owner": false
    }
  }'
```

## 🛠️ 故障排除

### 常见问题

#### Q: 为什么有时候密钥没有 Secret Access Key？

A: 出于安全考虑，Secret Access Key 只在密钥**首次创建时**显示一次。如果丢失了，需要重新创建密钥。

#### Q: 如何创建新的上传密钥？

A: 在 `/keys` 页面点击"创建新密钥"，然后设置合适的权限。

#### Q: 密钥权限不够怎么办？

A: 需要在存储桶管理页面为该密钥设置写入权限，或者重新创建具有足够权限的密钥。

#### Q: 文件上传返回成功但没有实际写入？

A: 这通常是因为缺少正确的 S3 认证信息。请检查：

- 密钥是否有效
- 权限是否正确设置
- 环境变量是否配置正确

### 网络检查

确保 Garage S3 API 端点可访问：

```bash
curl -v http://localhost:3900
```

确保 Garage 服务正常运行：

```bash
curl http://localhost:3903/health
curl http://localhost:3900/health
```

### 配置验证

检查 `.env.local` 文件中的配置：

```bash
# 验证环境变量
echo $GARAGE_S3_ACCESS_KEY_ID
echo $GARAGE_S3_SECRET_ACCESS_KEY
echo $NEXT_PUBLIC_S3_ENDPOINT_URL
```

## 📊 测试上传

配置完成后，重新尝试上传文件。查看控制台输出应该显示：

1. **客户端**: 上传进度从 0% 到 100%
2. **服务器端**: S3 认证成功，返回 200 状态码
3. **Garage 存储**: 文件实际写入存储系统

## 🎯 最佳实践

### 安全建议

1. **定期轮换密钥**: 定期更新访问密钥
2. **最小权限原则**: 只授予必要的权限
3. **监控使用**: 定期检查密钥使用情况
4. **环境分离**: 开发和生产环境使用不同的密钥

### 性能优化

1. **连接池**: 使用连接池优化 S3 连接
2. **并发上传**: 支持多文件并发上传
3. **断点续传**: 实现大文件断点续传
4. **压缩传输**: 启用传输压缩

## 📈 高级功能

### 多区域支持

```bash
# 配置多个 S3 端点
NEXT_PUBLIC_S3_ENDPOINT_URL_PRIMARY=http://localhost:3900
NEXT_PUBLIC_S3_ENDPOINT_URL_BACKUP=http://backup.localhost:3900
```

### 自定义上传策略

```javascript
// 自定义上传选项
const uploadOptions = {
  multipartThreshold: 50 * 1024 * 1024, // 50MB
  multipartChunkSize: 10 * 1024 * 1024, // 10MB
  maxRetries: 3,
  retryDelay: 1000,
};
```

## 📝 总结

**界面显示的访问密钥 = S3 API 认证密钥**

这是同一套密钥系统，用于：

- 管理界面显示和管理
- S3 API 上传文件认证
- 程序化访问 Garage 存储

通过智能认证系统，大部分情况下无需手动配置，系统会自动选择合适的密钥进行认证。
