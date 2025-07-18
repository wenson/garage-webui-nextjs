import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessKeyId, secretAccessKey } = body;
    
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { 
          valid: false,
          error: '缺少访问密钥 ID 或密钥'
        },
        { status: 400 }
      );
    }

    const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
    const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';
    
    if (!GARAGE_API_ADMIN_KEY) {
      return NextResponse.json(
        { 
          valid: false,
          error: '缺少管理员令牌配置'
        },
        { status: 401 }
      );
    }

    // 通过查询密钥信息来验证密钥是否存在和有效
    const response = await fetch(`${GARAGE_API_BASE_URL}/v2/GetKeyInfo?id=${accessKeyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          valid: false,
          error: '访问密钥不存在',
        });
      }
      
      const errorText = await response.text();
      return NextResponse.json({
        valid: false,
        error: `验证失败: ${response.status} ${response.statusText}`,
        details: errorText,
      });
    }

    const keyInfo = await response.json();
    
    // 检查密钥的权限
    const permissions = [];
    if (keyInfo.bucketLocalAlias) {
      permissions.push('桶管理权限');
    }
    if (keyInfo.bucketGlobalAlias) {
      permissions.push('全局桶权限');
    }
    if (keyInfo.permissions) {
      permissions.push('对象操作权限');
    }

    return NextResponse.json({
      valid: true,
      keyInfo: {
        name: keyInfo.name,
        accessKeyId: keyInfo.accessKeyId,
        permissions: keyInfo.permissions,
        buckets: keyInfo.buckets || [],
      },
      permissions,
      message: '密钥验证成功',
    });

  } catch (error) {
    console.error('验证 Root Key 失败:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: '验证过程中发生错误',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
