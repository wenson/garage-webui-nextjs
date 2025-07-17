# Garage Web UI - Next.js 版本

基于 [Garage 对象存储服务](https://garagehq.deuxfleurs.fr/) 的现代化 Next.js 14 管理界面。这是对原始 [garage-webui](https://github.com/khairul169/garage-webui) 项目的完全重写，采用 Next.js 和现代 React 模式。

![Garage Web UI Dashboard](https://via.placeholder.com/800x400/0066cc/ffffff?text=Garage+Web+UI+仪表板)

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-username/garage-webui-nextjs.git
cd garage-webui-nextjs

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 设置您的 Garage API 地址和令牌

# 4. 启动开发服务器
npm run dev

# 5. 访问 http://localhost:3000
```

> 💡 **提示**: 首次使用需要配置 Garage Admin API 地址和认证令牌。详见[配置章节](#-配置)。

## ✨ 主要特性

- **📊 仪表板**: 实时集群健康监控和统计信息
- **🏗️ 集群管理**: 节点状态、布局管理和集群操作
- **🪣 存储桶管理**: 完整的存储桶生命周期管理，集成对象浏览器
- **🔑 访问密钥管理**: 创建、管理和配置 S3 访问密钥
- **🔐 认证系统**: 简单安全登录，支持多用户配置
- **🎨 现代界面**: 简洁响应式设计，支持深色模式
- **⚡ 高性能**: 服务端渲染配合 React Query 缓存
- **🔧 开发体验**: TypeScript、ESLint 和现代工具链

## 🚀 技术栈

- **框架**: Next.js 15.4.1 with App Router
- **语言**: TypeScript 5+
- **样式**: Tailwind CSS 4
- **状态管理**: Zustand + TanStack React Query 5.83.0
- **表单**: React Hook Form with Zod 验证
- **图标**: Lucide React 0.525.0
- **通知**: Sonner 2.0.6
- **开发工具**: ESLint, TypeScript

## 🎯 项目状态

### ✅ 已完成

- **基础架构**: Next.js 项目搭建，TypeScript 配置
- **API 集成**: 完整的 Garage Admin API v2 代理层（32 个端点）
- **认证系统**: JWT 登录认证，简单用户名密码验证
- **访问密钥管理**: 创建、删除、权限管理
- **存储桶管理**: 基础 CRUD 操作
- **UI 组件**: 核心 UI 组件库

### 🚧 进行中

- **对象浏览器**: 文件上传、下载、文件夹导航
- **集群管理界面**: 节点状态、布局配置
- **监控仪表板**: 实时统计和健康状态

### 📋 待实现

- **高级权限管理**: 细粒度权限控制
- **批量操作**: 多选和批量文件操作
- **国际化**: 多语言支持

## 📋 前置要求

- Node.js 18+
- npm, yarn, 或 pnpm
- 运行中的 Garage 实例（启用 Admin API）

## 🛠️ 安装和运行

### 方式一：源码安装

```bash
# 克隆仓库
git clone https://github.com/your-username/garage-webui-nextjs.git
cd garage-webui-nextjs

# 安装依赖
npm install

# 复制环境变量配置
cp .env.example .env.local

# 配置 Garage 连接（参见配置章节）
# 编辑 .env.local 文件设置您的 Garage 配置

# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:3000
```

## ⚙️ 配置

### 环境变量

在项目根目录创建 `.env.local` 文件：

````env
### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Required: Garage API Configuration
GARAGE_API_BASE_URL=http://localhost:3903
GARAGE_API_ADMIN_KEY=your-admin-token-here

# Authentication Configuration (simple format)
AUTH_USER_PASS=admin:password
JWT_SECRET=your-jwt-secret-key

# Development Mode (optional)
NEXT_PUBLIC_DEFAULT_USERNAME=admin
NEXT_PUBLIC_DEFAULT_PASSWORD=password
````

**Note:** The authentication system uses simple username:password format, not bcrypt hashing. For multiple users, use comma-separated format: `user1:pass1,user2:pass2`

````

### Garage 配置

确保您的 `garage.toml` 启用了 Admin API：

```toml
[admin]
api_bind_addr = "[::]:3903"
admin_token = "your-admin-token-here"
metrics_token = "your-metrics-token"
````

## 🏃‍♂️ 开发

```bash
# 启动开发服务器（使用 Turbopack）
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint

# TypeScript 类型检查
npm run type-check
```

## 📁 项目结构

```
src/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 仪表板页面
│   ├── login/             # 登录认证
│   ├── cluster/           # 集群管理
│   ├── buckets/           # 存储桶管理
│   ├── keys/              # 访问密钥管理
│   └── api/               # API 路由
│       └── garage/v2/     # Garage API 代理层（32个端点）
├── components/            # React 组件
│   ├── ui/               # 基础 UI 组件
│   ├── layout/           # 布局组件
│   └── [feature]/        # 功能特定组件
├── hooks/                # 自定义 React Hooks
│   └── api/              # API 相关 hooks
├── lib/                  # 工具库和配置
│   ├── api-client.ts     # API 客户端
│   ├── garage-api-v2.ts  # Garage API v2 客户端
│   └── utils.ts          # 工具函数
├── stores/               # Zustand 状态管理
├── types/                # TypeScript 类型定义
└── providers/            # React 上下文提供者
```

## � API 集成

本应用通过多个 API 与 Garage 集成：

- **Admin API v2**: 集群管理、节点状态、存储桶操作（32 个端点代理）
- **S3 API**: 对象存储操作、文件上传下载
- **认证 API**: JWT 登录和会话管理

详细 API 文档请参见 [API_REFERENCE.md](./API_REFERENCE.md)。

## 🎯 核心功能

### 仪表板

- 实时集群健康监控
- 节点状态和连接性
- 存储使用统计
- 分区状态跟踪

### 访问密钥管理

- 生成和删除 S3 访问密钥
- 配置存储桶权限
- 基于角色的访问控制
- 权限的实时更新

### 存储桶管理

- 创建、删除和配置存储桶
- 设置配额和权限
- 网站托管配置
- 集成文件浏览器（开发中）

### 集群管理（开发中）

- 节点发现和管理
- 布局配置
- 区域和容量管理
- 性能监控

## 📷 功能演示

### 登录页面

![登录界面](https://via.placeholder.com/600x400/f8f9fa/343a40?text=登录界面)

### 访问密钥管理

![密钥管理](https://via.placeholder.com/600x400/e9ecef/495057?text=访问密钥管理)

### 存储桶管理

![存储桶管理](https://via.placeholder.com/600x400/dee2e6/6c757d?text=存储桶管理)

## � Vercel 部署

### 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/garage-webui-nextjs)

### 手动部署步骤

1. **Fork 此仓库** 到你的 GitHub 账户

2. **连接 Vercel**：

   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 登录
   - 点击 "New Project"
   - 选择你 fork 的仓库

3. **配置环境变量**：
   在 Vercel 项目设置中添加以下环境变量：

   | 变量名                 | 值                                    | 说明              |
   | ---------------------- | ------------------------------------- | ----------------- |
   | `GARAGE_API_BASE_URL`  | `https://your-garage-server.com:3903` | Garage API 地址   |
   | `GARAGE_API_ADMIN_KEY` | `your-admin-token`                    | Garage 管理员令牌 |
   | `AUTH_USER_PASS`       | `admin:password`                      | 登录用户名密码    |
   | `JWT_SECRET`           | `your-secret-key`                     | JWT 密钥          |

4. **部署**：点击 "Deploy" 按钮

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-username/garage-webui-nextjs.git
cd garage-webui-nextjs

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 文件

# 启动开发服务器
npm run dev
```

### 高级配置

#### 自定义域名

在 Vercel 项目设置中的 "Domains" 部分添加你的自定义域名。

#### 部署分支

默认部署 `main` 分支，可在 Vercel 设置中修改。

#### 环境变量管理

- 生产环境：在 Vercel Dashboard 设置
- 开发环境：使用 `.env.local` 文件

### 为什么选择 Vercel？

✅ **零配置部署** - 连接 GitHub 即可自动部署  
✅ **全球 CDN** - 自动优化全球访问速度  
✅ **自动 HTTPS** - 免费 SSL 证书  
✅ **无服务器架构** - 按需扩容，无需维护服务器  
✅ **预览部署** - 每个 PR 都有独立的预览环境  
✅ **免费额度** - 个人项目完全免费

### 环境变量配置

必需的环境变量：

| 变量名                 | 描述              | 示例                    |
| ---------------------- | ----------------- | ----------------------- |
| `GARAGE_API_BASE_URL`  | Garage API 地址   | `http://localhost:3903` |
| `GARAGE_API_ADMIN_KEY` | Garage 管理员令牌 | `your-admin-token`      |
| `AUTH_USER_PASS`       | 认证用户信息      | `admin:password`        |
| `JWT_SECRET`           | JWT 密钥          | `your-secret-key`       |

可选的环境变量：

| 变量名                         | 描述               | 默认值     |
| ------------------------------ | ------------------ | ---------- |
| `NEXT_PUBLIC_DEFAULT_USERNAME` | 默认用户名         | `admin`    |
| `NEXT_PUBLIC_DEFAULT_PASSWORD` | 默认密码           | `admin123` |
| `SESSION_TIMEOUT`              | 会话超时时间（秒） | `3600`     |

### 健康检查

部署后可以通过以下端点检查服务状态：

```bash
curl http://localhost:3000/api/health
```

响应示例：

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔒 安全特性

- JWT 令牌会话管理
- 简单用户名密码认证（支持多用户）
- Admin API 令牌验证
- 环境变量配置保护
- 开发和生产环境分离

> ⚠️ **注意**: 当前认证实现较为简单，生产环境建议：
>
> - 使用 bcrypt 或其他加密库进行密码哈希
> - 实施更强的 JWT 密钥管理
> - 添加 HTTPS 强制和 CSRF 保护

## 🎛️ 远程控制 Garage

### 支持的远程操作

这个 WebUI 通过 **Garage Admin API v2** 提供完整的 Garage 远程管理能力：

#### 🏗️ 集群管理

- **节点管理**: 查看节点状态、连接新节点、管理集群拓扑
- **布局配置**: 远程更新集群布局、应用配置变更
- **实时监控**: 集群健康状态、节点统计、存储使用情况

#### 🪣 存储和权限

- **存储桶操作**: 创建、删除、配置存储桶（配额、权限等）
- **访问密钥**: 远程创建和管理 S3 访问密钥
- **权限控制**: 精细化的存储桶访问权限管理

#### 🛡️ 安全管理

- **管理员令牌**: 创建、删除、管理 Admin API 令牌
- **用户认证**: 多用户登录和会话管理

### 远程访问配置

#### 1. 内网访问

```bash
# 设置局域网内的 Garage 服务器
GARAGE_API_BASE_URL=http://192.168.1.100:3903
```

#### 2. 公网访问（推荐使用 VPN）

```bash
# 通过域名访问
GARAGE_API_BASE_URL=https://garage.yourdomain.com:3903
```

#### 3. 通过代理访问

```bash
# 通过反向代理访问
GARAGE_API_BASE_URL=https://api.yourdomain.com/garage
```

### 安全建议

- **网络安全**: 建议通过 VPN 或 SSH 隧道访问
- **HTTPS**: 生产环境务必使用 HTTPS
- **防火墙**: 限制 Admin API 端口（3903）的访问
- **令牌管理**: 定期轮换管理员令牌

## 🔄 从原版迁移

这个 Next.js 版本在保持与原始 React + Vite 版本功能对等的同时，还增加了：

- 服务端渲染带来更好的性能
- 改进的 SEO 和初始加载时间
- 现代 React 模式（App Router, Server Components）
- 增强的开发体验
- 更好的 TypeScript 集成

详细迁移信息请参见 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)。

## 📚 相关文档

- [📋 功能概览](./GARAGE_WEBUI_FEATURES.md)
- [🏗️ 架构指南](./ARCHITECTURE.md)
- [🔄 迁移指南](./MIGRATION_GUIDE.md)
- [📡 API 参考](./API_REFERENCE.md)
- [📊 项目状态](./PROJECT_STATUS.md)

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 这个项目
2. 创建你的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件。

## 🙏 致谢

- 原始 [garage-webui](https://github.com/khairul169/garage-webui) 项目作者 [khairul169](https://github.com/khairul169)
- Deuxfleurs 团队的 [Garage](https://garagehq.deuxfleurs.fr/) 对象存储服务
- 出色的 React 和 Next.js 社区

## 📞 支持

- 🐛 [报告问题](https://github.com/your-username/garage-webui-nextjs/issues)
- 💬 [GitHub 讨论](https://github.com/your-username/garage-webui-nextjs/discussions)
- 📖 [文档](./docs/)

---

**使用 ❤️ 和 Next.js 15 构建**
