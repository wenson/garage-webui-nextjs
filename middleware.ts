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
  
  // 检查认证状态
  const token = request.cookies.get('auth-token')?.value;
  
  if (!token) {
    // 未认证，重定向到登录页面
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // 简单检查 token 是否存在（详细验证在 API 路由中进行）
  // Edge Runtime 不支持 crypto 模块，所以这里只做基础检查
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
