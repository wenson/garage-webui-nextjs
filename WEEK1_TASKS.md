# 第一阶段实现任务 - 认证系统与基础组件

## 🎯 第一周开发目标

基于当前项目状态，优先实现认证系统和基础 UI 组件，为后续功能模块奠定基础。

## 📋 Day 1-2: 认证系统实现

### 任务 1.1: 创建登录页面 (4 小时)

**创建文件**:

```bash
mkdir -p src/app/login
touch src/app/login/page.tsx
```

**实现代码**:

```typescript
// src/app/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const from = searchParams.get("from") || "/";

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace(from);
    }
  }, [user, router, from]);

  if (user?.isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Garage Web UI
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            请登录以管理您的对象存储服务
          </p>
        </div>
        <LoginForm redirectTo={from} />
      </div>
    </div>
  );
}
```

### 任务 1.2: 创建登录表单组件 (6 小时)

**创建文件**:

```bash
mkdir -p src/components/auth
touch src/components/auth/login-form.tsx
```

**实现代码**:

```typescript
// src/components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  username: z.string().min(1, "用户名不能为空"),
  password: z.string().min(1, "密码不能为空"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo?: string;
}

export default function LoginForm({ redirectTo = "/" }: LoginFormProps) {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.username, data.password);
      if (success) {
        toast.success("登录成功");
        router.push(redirectTo);
      } else {
        toast.error("用户名或密码错误");
      }
    } catch (error) {
      toast.error("登录失败，请稍后重试");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          用户名
        </label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          {...register("username")}
          error={errors.username?.message}
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          密码
        </label>
        <div className="mt-1 relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            {...register("password")}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" loading={isLoading} icon={LogIn}>
        登录
      </Button>
    </form>
  );
}
```

### 任务 1.3: 实现路由保护中间件 (3 小时)

**创建文件**:

```bash
touch middleware.ts
```

**实现代码**:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查是否为公共路由
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 检查静态资源和 API 路由
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 检查认证状态（从 localStorage 读取会在客户端处理）
  // 这里我们先允许通过，认证检查在客户端组件中处理
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### 任务 1.4: 完善认证工具函数 (2 小时)

**创建文件**:

```bash
touch src/lib/auth.ts
```

**实现代码**:

```typescript
// src/lib/auth.ts
import bcrypt from "bcryptjs";

/**
 * 验证密码哈希
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * 生成密码哈希
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 解析认证配置
 */
export function parseAuthConfig(authUserPass?: string) {
  if (!authUserPass) return null;

  const [username, hash] = authUserPass.split(":", 2);
  if (!username || !hash) return null;

  return { username, hash };
}

/**
 * 验证用户凭据
 */
export async function validateCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const authConfig = parseAuthConfig(process.env.AUTH_USER_PASS);

  if (!authConfig) {
    // 如果没有配置认证，允许任何非空用户名密码
    return username.length > 0 && password.length > 0;
  }

  if (username !== authConfig.username) {
    return false;
  }

  return await verifyPassword(password, authConfig.hash);
}
```

## 📋 Day 3-4: 基础 UI 组件实现

### 任务 2.1: Input 输入组件 (3 小时)

**创建文件**:

```bash
touch src/components/ui/input.tsx
```

**实现代码**:

```typescript
// src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          className={cn(
            "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
```

### 任务 2.2: Card 卡片组件 (2 小时)

**创建文件**:

```bash
touch src/components/ui/card.tsx
```

**实现代码**:

```typescript
// src/components/ui/card.tsx
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-gray-600 dark:text-gray-400", className)}
      {...props}
    >
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
```

### 任务 2.3: Badge 徽章组件 (1 小时)

**创建文件**:

```bash
touch src/components/ui/badge.tsx
```

**实现代码**:

```typescript
// src/components/ui/badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "secondary";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
```

### 任务 2.4: Loading 加载组件 (2 小时)

**创建文件**:

```bash
touch src/components/ui/loading.tsx
```

**实现代码**:

```typescript
// src/components/ui/loading.tsx
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

function Loading({ size = "md", className, text }: LoadingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizes[size]
          )}
        />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {text}
          </span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600",
        className
      )}
    />
  );
}

export { Loading, LoadingSkeleton, LoadingSpinner };
```

### 任务 2.5: Table 表格组件 (4 小时)

**创建文件**:

```bash
touch src/components/ui/table.tsx
```

**实现代码**:

```typescript
// src/components/ui/table.tsx
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

interface TableHeadProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

interface TableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

function Table({ className, children, ...props }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50 dark:bg-gray-700", className)} {...props}>
      {children}
    </thead>
  );
}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody
      className={cn("divide-y divide-gray-200 dark:divide-gray-700", className)}
      {...props}
    >
      {children}
    </tbody>
  );
}

function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td
      className={cn(
        "px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
```

## 📋 Day 5-7: 布局系统完善

### 任务 3.1: 完成 Sidebar 组件 (4 小时)

**创建文件**:

```bash
touch src/components/layout/sidebar.tsx
```

**实现代码**:

```typescript
// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Server,
  FolderOpen,
  Key,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "仪表板", href: "/", icon: LayoutDashboard },
  { name: "集群管理", href: "/cluster", icon: Server },
  { name: "存储桶", href: "/buckets", icon: FolderOpen },
  { name: "访问密钥", href: "/keys", icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Garage UI
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username || "用户"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">管理员</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          icon={LogOut}
          className="w-full justify-start"
        >
          登出
        </Button>
      </div>
    </div>
  );
}
```

### 任务 3.2: 更新 MainLayout 组件 (2 小时)

**更新文件**:

```typescript
// src/components/layout/main-layout.tsx
"use client";

import { useAuthStore } from "@/stores/auth-store";
import Sidebar from "./sidebar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user?.isAuthenticated) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user?.isAuthenticated) {
    return null; // 或者显示加载状态
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
```

### 任务 3.3: 更新根布局 (1 小时)

**更新文件**:

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/main-layout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garage Web UI",
  description: "Modern admin interface for Garage Object Storage",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

## ✅ 第一周验收标准

### 功能验收

- [ ] 用户可以访问 `/login` 页面
- [ ] 登录表单验证正常工作
- [ ] 成功登录后重定向到仪表板
- [ ] 侧边栏导航正常显示
- [ ] 用户可以正常登出
- [ ] 未认证用户会被重定向到登录页

### 组件验收

- [ ] 所有 UI 组件正常渲染
- [ ] 组件支持明暗主题
- [ ] 输入组件支持错误状态
- [ ] 表格组件响应式布局
- [ ] 加载组件动画正常

### 代码质量

- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查无错误
- [ ] 组件复用性良好
- [ ] 代码注释完整

## 🔧 开发注意事项

### 环境变量配置

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3903
NEXT_PUBLIC_API_ADMIN_KEY=your-admin-token
AUTH_USER_PASS=admin:$2y$10$hashedpassword
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 构建项目
npm run build
```

### 测试方式

1. 手动测试所有功能点
2. 检查各种屏幕尺寸下的显示效果
3. 验证明暗主题切换
4. 测试错误状态处理

---

_第一周结束后，我们将拥有一个完整的认证系统和基础组件库，为后续功能模块的开发奠定坚实基础。_
