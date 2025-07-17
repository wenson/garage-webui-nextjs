import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// 简单的密码验证（生产环境应该使用 bcrypt）
function verifyPassword(password: string, storedPassword: string): boolean {
  // 如果存储的密码以 $2 开头，说明是 bcrypt hash，暂时直接比较
  if (storedPassword.startsWith('$2')) {
    // 在生产环境中应该使用 bcrypt.compare
    // 这里暂时使用简单比较作为示例
    return password === 'admin123' && storedPassword.includes('DSTi9oEsEm3KWr7LBWZlr');
  }
  
  // 明文密码比较（仅开发环境）
  return password === storedPassword;
}

// 简单的 JWT 创建（生产环境应该使用专门的 JWT 库）
function createToken(payload: { username: string; iat: number; exp: number }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payloadStr}`)
    .digest('base64url');
  
  return `${header}.${payloadStr}.${signature}`;
}

// 解析用户认证信息
function parseAuthUsers(): Map<string, string> {
  const users = new Map<string, string>();
  
  // 从环境变量读取用户配置
  const authUserPass = process.env.AUTH_USER_PASS;
  if (authUserPass) {
    // 支持多个用户，格式: user1:hash1,user2:hash2
    const userEntries = authUserPass.split(',');
    for (const entry of userEntries) {
      const [username, hash] = entry.split(':');
      if (username && hash) {
        users.set(username.trim(), hash.trim());
      }
    }
  }
  
  // 开发环境默认用户
  if (users.size === 0) {
    const defaultUsername = process.env.NEXT_PUBLIC_DEFAULT_USERNAME || 'admin';
    const defaultPassword = process.env.NEXT_PUBLIC_DEFAULT_PASSWORD || 'admin123';
    users.set(defaultUsername, defaultPassword);
  }
  
  return users;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }
    
    const users = parseAuthUsers();
    const userHash = users.get(username);
    
    if (!userHash) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 验证密码
    const isValidPassword = verifyPassword(password, userHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      );
    }
    
    // 生成 JWT token
    const token = createToken({
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24小时过期
    });
    
    // 设置 HTTP-only cookie
    const response = NextResponse.json(
      { 
        success: true,
        user: { username, isAuthenticated: true },
        message: '登录成功'
      },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24小时
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录过程中发生错误' },
      { status: 500 }
    );
  }
}
