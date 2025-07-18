import { NextRequest, NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 在 Next.js 15 中需要先 await params
    const params = await context.params;
    
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || '';
    const bucketName = searchParams.get('bucketName');
    const continuationToken = searchParams.get('continuation-token');
    
    if (!bucketName) {
      return NextResponse.json(
        { error: 'bucketName parameter is required' },
        { status: 400 }
      );
    }

    // 使用 Garage 的 GetBucketInfo API 来验证桶存在
    const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
    const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';
    
    // 首先检查桶是否存在
    const bucketInfoUrl = new URL(`${GARAGE_API_BASE_URL}/v2/GetBucketInfo`);
    bucketInfoUrl.searchParams.set('id', params.id);
    
    const bucketInfoResponse = await fetch(bucketInfoUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bucketInfoResponse.ok) {
      if (bucketInfoResponse.status === 404) {
        return NextResponse.json(
          { error: 'Bucket not found' },
          { status: 404 }
        );
      }
      throw new Error(`Failed to get bucket info: ${bucketInfoResponse.status}`);
    }

    const bucketInfo = await bucketInfoResponse.json();
    console.log(`存储桶信息获取成功: ${bucketInfo.id || bucketName}`);
    
    // 现在使用 AWS SDK 直接连接 S3
    const s3EndpointUrl = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900';
    
    // 获取S3认证信息
    const s3AccessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID || '';
    const s3SecretAccessKey = process.env.GARAGE_S3_SECRET_ACCESS_KEY || '';
    
    if (!s3AccessKeyId || !s3SecretAccessKey) {
      return NextResponse.json({
        objects: [],
        prefixes: [],
        isTruncated: false,
        error: '缺少S3认证信息'
      });
    }

    console.log(`使用S3 SDK连接: ${s3EndpointUrl}`);
    console.log(`Access Key: ${s3AccessKeyId}`);
    console.log(`Secret Key长度: ${s3SecretAccessKey.length}`);

    // 创建S3客户端
    const s3Client = new S3Client({
      endpoint: s3EndpointUrl,
      region: 'garage', // 使用garage作为区域
      credentials: {
        accessKeyId: s3AccessKeyId,
        secretAccessKey: s3SecretAccessKey,
      },
      forcePathStyle: true, // 对于Garage很重要
      // 禁用一些AWS特定的功能
      serviceId: 's3',
    });

    try {
      // 构建ListObjectsV2命令
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix || undefined,
        ContinuationToken: continuationToken || undefined,
        Delimiter: '/',
        MaxKeys: 1000,
      });

      console.log(`执行S3 ListObjectsV2命令:`, {
        Bucket: bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      
      console.log(`S3 SDK响应:`, {
        KeyCount: response.KeyCount,
        IsTruncated: response.IsTruncated,
        CommonPrefixes: response.CommonPrefixes?.length || 0,
        Contents: response.Contents?.length || 0,
      });

      // 转换为我们的格式
      const objects = [];
      
      // 添加文件
      if (response.Contents) {
        for (const obj of response.Contents) {
          objects.push({
            key: obj.Key || '',
            lastModified: obj.LastModified?.toISOString() || '',
            etag: obj.ETag?.replace(/"/g, '') || '',
            size: obj.Size || 0,
            storageClass: obj.StorageClass || 'STANDARD',
            isFolder: false,
          });
        }
      }

      // 添加文件夹
      if (response.CommonPrefixes) {
        for (const prefix of response.CommonPrefixes) {
          objects.push({
            key: prefix.Prefix || '',
            lastModified: '',
            etag: '',
            size: 0,
            storageClass: 'DIRECTORY',
            isFolder: true,
          });
        }
      }

      return NextResponse.json({
        objects,
        prefixes: response.CommonPrefixes?.map(p => p.Prefix || '') || [],
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
      });

    } catch (s3Error) {
      console.error('S3 SDK错误:', s3Error);
      return NextResponse.json({
        objects: [],
        prefixes: [],
        isTruncated: false,
        error: `S3 SDK错误: ${s3Error instanceof Error ? s3Error.message : '未知错误'}`
      });
    }

  } catch (error) {
    console.error('Failed to list objects:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to list bucket objects',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
