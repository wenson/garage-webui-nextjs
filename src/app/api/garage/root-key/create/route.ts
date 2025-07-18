import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, globalPermissions = true } = body;
    
    if (!name) {
      return NextResponse.json(
        { error: 'Key name is required' },
        { status: 400 }
      );
    }

    const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
    const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';
    
    if (!GARAGE_API_ADMIN_KEY) {
      return NextResponse.json(
        { error: '缺少管理员令牌配置' },
        { status: 401 }
      );
    }

    console.log(`创建 Root Key: ${name}`);

    // Step 1: 创建密钥（直接在创建时设置全局权限）
    const createKeyResponse = await fetch(`${GARAGE_API_BASE_URL}/v2/CreateKey`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        neverExpires: true, // Root Key 永不过期
        allow: globalPermissions ? {
          createBucket: true, // 允许创建桶
        } : undefined,
      }),
    });

    if (!createKeyResponse.ok) {
      const errorText = await createKeyResponse.text();
      console.error(`创建密钥失败: ${createKeyResponse.status}`, errorText);
      return NextResponse.json(
        { 
          error: `创建密钥失败: ${createKeyResponse.status} ${createKeyResponse.statusText}`,
          details: errorText
        },
        { status: createKeyResponse.status }
      );
    }

    const keyData = await createKeyResponse.json();
    console.log(`密钥创建成功:`, { 
      accessKeyId: keyData.accessKeyId,
      secretKeyCreated: !!keyData.secretAccessKey 
    });

    // Step 2: 如果需要全局权限，为所有现有桶授权
    if (globalPermissions) {
      console.log(`为密钥 ${keyData.accessKeyId} 授予全局权限`);
      
      // 首先获取所有存储桶列表
      const bucketsResponse = await fetch(`${GARAGE_API_BASE_URL}/v2/GetBuckets`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (bucketsResponse.ok) {
        const bucketsData = await bucketsResponse.json();
        const buckets = bucketsData.buckets || [];
        
        // 为每个现有桶授予权限
        const permissionPromises = buckets.map(async (bucket: { id: string }) => {
          try {
            const grantResponse = await fetch(`${GARAGE_API_BASE_URL}/v2/AllowBucketKey`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
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
            return { bucketId: bucket.id, success: false, error: error instanceof Error ? error.message : '未知错误' };
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
            warning: `密钥创建成功，但 ${failedPermissions.length}/${buckets.length} 个桶授权失败`,
            permissionResults,
          });
        }
        
        console.log(`成功为 ${buckets.length} 个桶授予权限`);
      } else {
        const errorText = await bucketsResponse.text();
        console.warn(`获取桶列表失败: ${bucketsResponse.status}`, errorText);
        
        return NextResponse.json({
          success: true,
          accessKeyId: keyData.accessKeyId,
          secretAccessKey: keyData.secretAccessKey,
          name: keyData.name,
          warning: `密钥创建成功，但无法获取桶列表进行授权。新创建的桶仍可通过 createBucket 权限管理。`,
          permissionError: errorText,
        });
      }
    }

    return NextResponse.json({
      success: true,
      accessKeyId: keyData.accessKeyId,
      secretAccessKey: keyData.secretAccessKey,
      name: keyData.name,
      globalPermissions: globalPermissions,
      message: globalPermissions ? 
        '成功创建具有全局权限的 Root Key（包含创建桶权限和所有现有桶的读写权限）' : 
        '成功创建密钥（无全局权限）',
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
