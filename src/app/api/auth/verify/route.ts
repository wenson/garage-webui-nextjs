import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

// 简单的 JWT 验证（生产环境应该使用专门的 JWT 库）
function verifyToken(token: string): { username: string; iat: number; exp: number } | null {
  try {
    const [header, payload, signature] = token.split('.');
    
    // 验证签名
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    // 解析 payload
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());
    
    // 检查过期时间
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return decodedPayload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 从 cookie 中获取 token
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: '未找到认证令牌' },
        { status: 401 }
      );
    }
    
    // 验证 token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json(
        { error: '认证令牌无效或已过期' },
        { status: 401 }
      );
    }
    
    // 返回用户信息
    return NextResponse.json(
      { 
        success: true,
        user: { 
          username: decoded.username, 
          isAuthenticated: true 
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: '验证认证令牌时发生错误' },
      { status: 500 }
    );
  }
}
