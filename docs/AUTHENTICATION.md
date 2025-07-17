# 认证与登录配置

## 📋 用户名密码设置位置

### 1. 开发环境默认凭证

在开发环境中，已配置默认的登录凭证：

**位置**: `.env.local` 文件

```env
NEXT_PUBLIC_DEFAULT_USERNAME=admin
NEXT_PUBLIC_DEFAULT_PASSWORD=admin123
```

**默认凭证**:

- 用户名: `admin`
- 密码: `admin123`

### 2. 认证逻辑实现

**位置**: `src/stores/auth-store.ts`

```typescript
// 检查环境变量中的默认用户名密码
const defaultUsername = process.env.NEXT_PUBLIC_DEFAULT_USERNAME || "admin";
const defaultPassword = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || "admin123";

// 验证凭证
const isValidCredentials =
  (username === defaultUsername && password === defaultPassword) ||
  (username && password); // 兜底：接受任何非空凭证
```

### 3. 登录表单

**位置**: `src/components/auth/login-form.tsx`

- 使用 React Hook Form 进行表单验证
- 集成 Zod 进行输入验证
- 支持密码显示/隐藏切换

## 🔧 如何修改登录凭证

### 方法一：修改环境变量

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_DEFAULT_USERNAME=your_username
NEXT_PUBLIC_DEFAULT_PASSWORD=your_password
```

### 方法二：集成真实的 Garage Admin API

修改 `src/stores/auth-store.ts` 中的 `login` 函数：

```typescript
login: async (username: string, password: string) => {
  set({ isLoading: true });

  try {
    // 调用真实的 Garage Admin API
    const response = await fetch(`${API_BASE_URL}/v0/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_ADMIN_KEY}`
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      const user: AuthUser = {
        username: userData.username,
        isAuthenticated: true,
      };

      set({ user, isLoading: false });
      return true;
    }

    set({ isLoading: false });
    return false;
  } catch (error) {
    console.error('Login error:', error);
    set({ isLoading: false });
    return false;
  }
},
```

## 🚀 快速登录测试

### 当前可用的登录方式：

1. **默认管理员账户**:

   - 用户名: `admin`
   - 密码: `admin123`

2. **任意凭证（开发模式）**:
   - 任何非空的用户名和密码组合都会被接受

### 登录页面访问：

- URL: http://localhost:3000/login
- 登录成功后会重定向到首页仪表板

## 🔒 生产环境安全配置

### 1. 禁用开发模式登录

在 `auth-store.ts` 中移除兜底逻辑：

```typescript
// 仅接受默认凭证或真实API验证
const isValidCredentials =
  username === defaultUsername && password === defaultPassword;
```

### 2. 使用环境变量保护敏感信息

```env
# 生产环境配置
NODE_ENV=production
NEXT_PUBLIC_DEFAULT_USERNAME=
NEXT_PUBLIC_DEFAULT_PASSWORD=
GARAGE_ADMIN_API_KEY=your_secure_api_key
```

### 3. 集成 Garage 认证系统

参考 [Garage 官方文档](https://garagehq.deuxfleurs.fr/) 配置正确的认证流程。

## 📁 相关文件位置

```
src/
├── stores/
│   └── auth-store.ts          # 认证状态管理
├── components/
│   └── auth/
│       └── login-form.tsx     # 登录表单组件
├── app/
│   └── login/
│       └── page.tsx           # 登录页面
├── lib/
│   └── constants.ts           # 应用常量配置
└── middleware.ts              # 路由中间件
.env.local                     # 本地环境变量
.env.example                   # 环境变量示例
```
