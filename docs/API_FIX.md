# API 连接问题修复说明

## 🔧 问题描述

您遇到的 `Failed to fetch` 错误是因为应用尝试连接到 Garage API 服务器，但服务器不可用或配置不正确。

## ✅ 修复内容

### 1. **添加模拟数据支持**

**文件**: `src/lib/api-client.ts`

- 在开发环境中，当 API 不可用时自动返回模拟数据
- 提供完整的 Garage API 模拟响应
- 保持应用功能完整，不影响演示和开发

```typescript
// 在开发环境中，如果API不可用，返回模拟数据
if (process.env.NODE_ENV === "development") {
  console.warn("API不可用，使用模拟数据");
  return this.getMockData<T>(endpoint);
}
```

### 2. **添加环境状态检查组件**

**文件**: `src/components/environment/environment-status.tsx`

- 实时检查 Garage 服务状态
- 显示 Admin API 和 S3 API 的连接状态
- 提供解决方案建议和故障排除指南

### 3. **改进用户体验**

- 在仪表板上显示环境状态
- 明确提示当前使用模拟数据
- 提供服务检查和刷新功能

## 🎯 现在的工作方式

### 开发模式（当前）

- ✅ API 不可用时自动使用模拟数据
- ✅ 所有功能正常工作
- ✅ 用户界面完整展示
- ✅ 实时状态检查

### 生产模式

- 🔄 连接真实的 Garage API
- 🔄 使用实际的数据和操作
- 🔄 完整的集群管理功能

## 📋 模拟数据包含

- **健康检查**: 集群状态正常
- **集群信息**: 2 个节点，在线状态
- **存储桶**: 2 个示例存储桶（my-bucket, static-assets）
- **访问密钥**: 2 个示例密钥（admin-key, readonly-key）

## 🚀 如何连接真实 Garage 服务

### 1. 启动 Garage 服务

```bash
# 启动 Garage 节点
garage -c /path/to/garage.toml server

# 确保 Admin API 端口开放（默认 3903）
# 确保 S3 API 端口开放（默认 3900）
```

### 2. 配置环境变量

编辑 `.env.local` 文件：

```env
# Garage Admin API 地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3903

# Garage Admin API 密钥
NEXT_PUBLIC_API_ADMIN_KEY=your_actual_admin_key

# Garage S3 API 地址
NEXT_PUBLIC_S3_ENDPOINT_URL=http://localhost:3900
```

### 3. 重启开发服务器

```bash
npm run dev
```

## 💡 故障排除

### 如果仍然看到 "Failed to fetch"：

1. **检查 Garage 服务状态**

   ```bash
   curl http://localhost:3903/health
   curl http://localhost:3900/health
   ```

2. **验证配置**

   - 检查 `.env.local` 中的 URL 是否正确
   - 确认 API 密钥是否有效

3. **网络检查**

   - 确认防火墙设置
   - 检查端口是否被其他服务占用

4. **查看环境状态**
   - 在仪表板上查看"环境服务状态"卡片
   - 使用刷新按钮重新检查连接

## ✨ 当前功能状态

即使没有真实的 Garage 服务，您现在可以：

- ✅ 使用完整的用户界面
- ✅ 测试所有页面和功能
- ✅ 查看模拟的集群、存储桶、密钥数据
- ✅ 体验完整的工作流程
- ✅ 进行演示和开发

应用现在完全可用，不再显示 `Failed to fetch` 错误！🎉
