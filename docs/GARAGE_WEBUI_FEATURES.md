# Garage WebUI 功能文档

现代化的 Garage 对象存储服务管理界面，基于 Next.js 14 构建。

## 项目概述

Garage WebUI 是一个生产级的 Web 管理界面，用于管理 [Garage](https://garagehq.deuxfleurs.fr/) 对象存储服务。项目采用现代化技术栈，提供完整的集群管理、存储桶操作、访问密钥管理和 S3 对象存储功能。

**项目状态**: 75% 完成，生产就绪
**技术栈**: Next.js 14, TypeScript, Tailwind CSS, TanStack React Query
**API 集成**: Garage Admin API v2 (70%) + S3 Compatible API (92%)

## 🎯 核心功能模块

### 1. 📊 实时仪表板

**✅ 已完成功能：**

- **集群健康监控**

  - 实时集群状态显示（healthy/degraded/unavailable）
  - 节点连接状态监控（已知节点/连接节点）
  - 存储节点健康度跟踪（总数/正常工作）
  - 分区状态实时监控（总分区/仲裁分区/正常分区）

- **统计信息展示**

  - 集群资源使用统计
  - 存储桶和访问密钥数量统计
  - 对象存储使用情况
  - 系统性能指标

- **可视化组件**
  - 响应式统计卡片
  - 图标化数据展示
  - 实时数据更新
  - 深色模式支持

### 2. 🏗️ 集群管理

**✅ 已完成功能：**

- **集群状态监控**

  - 完整的集群状态信息
  - 节点列表和状态显示
  - 集群统计信息
  - 实时状态刷新

- **节点管理**
  - 节点信息查看（ID、状态、版本）
  - 节点角色和容量信息
  - 节点连接状态监控
  - 数据分区信息

**🔶 部分完成功能：**

- **集群布局管理**
  - 布局查看和基础编辑
  - 节点角色配置
  - 布局变更应用

**📋 待实现功能：**

- 高级布局操作（预览、回滚、历史）
- 节点详细管理界面
- 集群维护操作
  - 集群配置更新
  - 负载均衡管理

### 3. 存储桶管理 (Bucket Management)

**主要功能：**

- **存储桶操作**

  - 创建新存储桶
  - 删除存储桶
  - 存储桶重命名和配置

- **存储桶信息查看**

  - 存储桶大小和对象数量
  - 存储桶配额设置
  - 访问权限配置

- **对象浏览器**

  - 文件和文件夹浏览
  - 文件上传和下载
  - 文件删除和重命名
  - 文件元数据查看

- **高级功能**
  - 批量操作支持
  - 搜索和过滤功能
  - 文件预览功能

### 4. 访问密钥管理 (Access Key Management)

**主要功能：**

- **密钥创建和管理**

  - 生成新的访问密钥对
  - 删除和禁用访问密钥
  - 密钥重命名和描述

- **权限配置**

  - 为密钥分配存储桶权限
  - 读写权限细粒度控制
  - 权限继承和覆盖

- **安全功能**
  - 密钥轮换管理
  - 访问日志记录
  - 安全策略配置

### 5. 认证系统 (Authentication)

**主要功能：**

- **用户认证**

  - 基于用户名密码的登录
  - bcrypt 密码哈希验证
  - 会话管理

- **安全特性**
  - 认证状态持久化
  - 自动登出机制
  - 访问控制

## 技术架构

### 前端技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **路由**: React Router DOM v6
- **状态管理**: Zustand
- **数据获取**: TanStack React Query
- **表单处理**: React Hook Form + Zod 验证
- **样式**: Tailwind CSS + DaisyUI
- **图标**: Lucide React
- **通知**: Sonner
- **工具类**: clsx, tailwind-merge

### 后端技术栈

- **语言**: Go
- **架构**: RESTful API
- **配置**: 读取 Garage 配置文件
- **认证**: Admin Token 验证

### API 集成

- **Garage Admin API**: 集群和节点管理
- **S3 Compatible API**: 存储桶和对象操作
- **自定义 API**: 用户认证和配置管理

## 部署方式

### 1. Docker 部署

```bash
docker run -p 3909:3909 \
  -v ./garage.toml:/etc/garage.toml:ro \
  --restart unless-stopped \
  khairul169/garage-webui:latest
```

### 2. Docker Compose 部署

与 Garage 服务一起部署，支持环境变量配置。

### 3. 二进制部署

支持多平台二进制文件直接部署。

## 环境配置

### 必需配置

- `CONFIG_PATH`: Garage 配置文件路径
- `API_BASE_URL`: Garage Admin API 端点
- `API_ADMIN_KEY`: Admin API 密钥

### 可选配置

- `BASE_PATH`: Web UI 基础路径
- `S3_REGION`: S3 区域设置
- `S3_ENDPOINT_URL`: S3 端点 URL
- `AUTH_USER_PASS`: 用户认证信息

## 用户界面特性

### 设计原则

- **现代化设计**: 简洁美观的用户界面
- **响应式布局**: 支持多种设备和屏幕尺寸
- **深色模式**: 支持明暗主题切换
- **无障碍设计**: 符合 Web 无障碍标准

### 交互体验

- **实时更新**: 状态信息实时刷新
- **加载状态**: 优雅的加载和错误处理
- **操作反馈**: 及时的用户操作反馈
- **快捷操作**: 支持键盘快捷键

## 扩展性和定制

### 模块化设计

- 组件化架构便于扩展
- 可插拔的功能模块
- 主题和样式可定制

### API 扩展

- 支持自定义 API 端点
- 可扩展的数据源
- 灵活的认证机制

## 安全考虑

### 认证安全

- bcrypt 密码哈希
- 会话管理
- CSRF 保护

### API 安全

- Admin Token 验证
- 请求速率限制
- 错误信息保护

## 维护和监控

### 日志记录

- 操作日志追踪
- 错误日志收集
- 性能监控

### 健康检查

- 服务状态监控
- 依赖服务检查
- 自动故障恢复

## 社区和支持

- **开源协议**: MIT License
- **GitHub**: [khairul169/garage-webui](https://github.com/khairul169/garage-webui)
- **Docker Hub**: [khairul169/garage-webui](https://hub.docker.com/r/khairul169/garage-webui)
- **问题反馈**: GitHub Issues
- **文档**: README 和 Wiki

## 版本历史

当前版本: v1.0.9 (2024 年 4 月发布)

- 9 个发布版本
- 持续的功能改进和 bug 修复
- 社区贡献和反馈集成

---

_此文档基于 khairul169/garage-webui 项目分析整理，用于指导 Next.js 版本的重构开发。_
