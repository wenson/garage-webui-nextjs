import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 创建响应并清除认证 cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: '退出登录成功'
      },
      { status: 200 }
    );
    
    // 清除认证 cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '退出登录过程中发生错误' },
      { status: 500 }
    );
  }
}
