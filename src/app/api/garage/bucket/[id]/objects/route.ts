import { NextRequest, NextResponse } from 'next/server';

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
    
    // 现在使用 S3 API 获取对象列表
    const s3EndpointUrl = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900';
    const s3Url = new URL(`/${bucketName}`, s3EndpointUrl);
    s3Url.searchParams.set('list-type', '2');
    s3Url.searchParams.set('delimiter', '/');
    s3Url.searchParams.set('max-keys', '1000');
    
    if (prefix) {
      s3Url.searchParams.set('prefix', prefix);
    }
    
    if (continuationToken) {
      s3Url.searchParams.set('continuation-token', continuationToken);
    }

    // 注意：这里需要 S3 访问密钥，但当前实现可能需要调整
    // 暂时返回模拟数据或使用管理员权限
    const s3Response = await fetch(s3Url.toString(), {
      method: 'GET',
      headers: {
        'Host': new URL(s3EndpointUrl).host,
        // 这里需要正确的 S3 签名，暂时简化处理
      },
    });

    if (s3Response.ok) {
      const xmlText = await s3Response.text();
      const result = parseListObjectsV2Response(xmlText);
      return NextResponse.json(result);
    } else {
      // 如果 S3 API 失败，返回基本的桶信息
      return NextResponse.json({
        objects: [],
        prefixes: [],
        isTruncated: false,
        nextContinuationToken: undefined,
        bucketInfo: bucketInfo,
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

// 解析 S3 XML 响应
function parseListObjectsV2Response(xmlText: string) {
  const objects: Array<{
    key: string;
    lastModified: string;
    etag: string;
    size: number;
    storageClass: string;
    isFolder: boolean;
  }> = [];
  
  const prefixes: string[] = [];
  
  // 解析 Contents（对象）
  const contentsRegex = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match;
  
  while ((match = contentsRegex.exec(xmlText)) !== null) {
    const content = match[1];
    const key = content.match(/<Key>(.*?)<\/Key>/)?.[1] || '';
    const lastModified = content.match(/<LastModified>(.*?)<\/LastModified>/)?.[1] || '';
    const etag = content.match(/<ETag>(.*?)<\/ETag>/)?.[1]?.replace(/"/g, '') || '';
    const size = parseInt(content.match(/<Size>(.*?)<\/Size>/)?.[1] || '0');
    const storageClass = content.match(/<StorageClass>(.*?)<\/StorageClass>/)?.[1] || 'STANDARD';
    
    if (key) {
      objects.push({
        key,
        lastModified,
        etag,
        size,
        storageClass,
        isFolder: false,
      });
    }
  }
  
  // 解析 CommonPrefixes（文件夹）
  const prefixRegex = /<CommonPrefixes>[\s\S]*?<Prefix>(.*?)<\/Prefix>[\s\S]*?<\/CommonPrefixes>/g;
  while ((match = prefixRegex.exec(xmlText)) !== null) {
    prefixes.push(match[1]);
  }
  
  // 解析其他元数据
  const isTruncated = xmlText.includes('<IsTruncated>true</IsTruncated>');
  const nextContinuationTokenMatch = xmlText.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/);
  const nextContinuationToken = nextContinuationTokenMatch?.[1];
  
  return {
    objects,
    prefixes,
    isTruncated,
    nextContinuationToken,
  };
}
