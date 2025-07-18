import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Key name is required' },
        { status: 400 }
      );
    }

    console.log(`创建 Root Key: ${name}`);

    // Step 1: 调用 v2/CreateKey API
    const createKeyResponse = await fetch(`${request.nextUrl.origin}/api/garage/v2/CreateKey`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        neverExpires: true,
        allow: {
          createBucket: true,
        },
      }),
    });

    if (!createKeyResponse.ok) {
      const errorData = await createKeyResponse.json().catch(() => ({ error: '创建密钥失败' }));
      return NextResponse.json(
        { error: errorData.error || '创建密钥失败' },
        { status: createKeyResponse.status }
      );
    }

    const keyData = await createKeyResponse.json();
    
    console.log(`密钥创建成功:`, { 
      accessKeyId: keyData.accessKeyId,
      secretKeyCreated: !!keyData.secretAccessKey 
    });

    // Step 2: 获取所有存储桶并授权
    const bucketsResponse = await fetch(`${request.nextUrl.origin}/api/garage/v2/ListBuckets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (bucketsResponse.ok) {
      const bucketsData = await bucketsResponse.json();
      const buckets = bucketsData.buckets || [];
      
      console.log(`为 ${buckets.length} 个桶授予权限`);
      
      // 为每个现有桶授予权限
      const permissionPromises = buckets.map(async (bucket: { id: string }) => {
        try {
          const grantResponse = await fetch(`${request.nextUrl.origin}/api/garage/v2/AllowBucketKey`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucketId: bucket.id,
              accessKeyId: keyData.accessKeyId,
              permissions: {
                read: true,
                write: true,
                owner: true,
              },
            }),
          });
          
          if (!grantResponse.ok) {
            const errorText = await grantResponse.text();
            console.warn(`为桶 ${bucket.id} 授权失败:`, errorText);
            return { bucketId: bucket.id, success: false, error: errorText };
          }
          
          return { bucketId: bucket.id, success: true };
        } catch (error) {
          console.warn(`为桶 ${bucket.id} 授权异常:`, error);
          return { 
            bucketId: bucket.id, 
            success: false, 
            error: error instanceof Error ? error.message : '未知错误' 
          };
        }
      });

      const permissionResults = await Promise.all(permissionPromises);
      const failedPermissions = permissionResults.filter(result => !result.success);
      
      if (failedPermissions.length > 0) {
        console.warn(`部分桶授权失败:`, failedPermissions);
        return NextResponse.json({
          success: true,
          accessKeyId: keyData.accessKeyId,
          secretAccessKey: keyData.secretAccessKey,
          name: keyData.name,
          globalPermissions: true,
          warning: `密钥创建成功，但 ${failedPermissions.length}/${buckets.length} 个桶授权失败`,
          permissionResults,
          message: 'Root Key 创建成功（部分权限授予失败）',
        });
      }
      
      console.log(`所有桶权限授予成功`);
    } else {
      console.warn('获取桶列表失败，跳过权限授予');
    }

    return NextResponse.json({
      success: true,
      accessKeyId: keyData.accessKeyId,
      secretAccessKey: keyData.secretAccessKey,
      name: keyData.name,
      globalPermissions: true,
      message: '成功创建具有全局权限的 Root Key',
    });

  } catch (error) {
    console.error('创建 Root Key 失败:', error);
    return NextResponse.json(
      { 
        error: '创建 Root Key 失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}

// 检查环境配置
export async function GET() {
  try {
    const accessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.GARAGE_S3_SECRET_ACCESS_KEY;
    
    return NextResponse.json({
      isConfigured: !!(accessKeyId && secretAccessKey),
      accessKeyId: accessKeyId ? accessKeyId.substring(0, 8) + '...' : undefined,
      hasSecretKey: !!secretAccessKey,
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: '检查配置失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
}
