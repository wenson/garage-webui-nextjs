import { NextRequest, NextResponse } from 'next/server';
import { generateS3AuthHeaders } from '@/lib/s3-auth';

export async function POST(
  request: NextRequest
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const objectKey = formData.get('objectKey') as string;
    const bucketName = formData.get('bucketName') as string;
    // 可选的上传密钥（从前端传递）
    const uploadAccessKeyId = formData.get('accessKeyId') as string;
    const uploadSecretAccessKey = formData.get('secretAccessKey') as string;
    
    console.log(`收到上传请求: 文件=${file?.name}, 大小=${file?.size}, 对象键=${objectKey}, 存储桶=${bucketName}`);
    console.log(`使用密钥: ${uploadAccessKeyId ? '前端提供' : '环境变量'}`);
    
    if (!file || !objectKey || !bucketName) {
      console.error('缺少必需参数');
      return NextResponse.json(
        { error: 'Missing required parameters: file, objectKey, bucketName' },
        { status: 400 }
      );
    }

    // 优先使用前端传递的密钥，其次使用环境变量
    const accessKeyId = uploadAccessKeyId || process.env.GARAGE_S3_ACCESS_KEY_ID;
    const secretAccessKey = uploadSecretAccessKey || process.env.GARAGE_S3_SECRET_ACCESS_KEY;
    
    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { 
          error: '无可用的上传凭据',
          details: '请提供访问密钥或在环境变量中配置 GARAGE_S3_ACCESS_KEY_ID 和 GARAGE_S3_SECRET_ACCESS_KEY'
        },
        { status: 401 }
      );
    }

    const s3EndpointUrl = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900';
    
    // 构建 S3 PUT 请求 URL
    const s3Url = new URL(`/${bucketName}/${objectKey}`, s3EndpointUrl);
    
    console.log(`准备上传到 S3: URL=${s3Url.toString()}`);
    
    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('上传超时，中止请求');
      controller.abort();
    }, 10 * 60 * 1000); // 10分钟超时
    
    try {
      let headers: Record<string, string>;
      
      if (accessKeyId && secretAccessKey) {
        // 使用提供的 S3 认证
        const s3Config = {
          accessKeyId,
          secretAccessKey,
          endpoint: s3EndpointUrl,
          bucket: bucketName
        };
        
        headers = generateS3AuthHeaders(
          'PUT',
          s3Url.toString(),
          file.type || 'application/octet-stream',
          file.size,
          s3Config
        );
        console.log(`使用 S3 认证上传 (密钥: ${accessKeyId})`);
      } else {
        // 回退到基本头部（用于测试）
        headers = {
          'Content-Type': file.type || 'application/octet-stream',
          'Content-Length': file.size.toString(),
        };
        console.log('警告：使用无认证模式上传（仅用于测试）');
      }
      
      // 使用 PUT 方法上传文件到 S3
      const s3Response = await fetch(s3Url.toString(), {
        method: 'PUT',
        body: file,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`S3 响应状态: ${s3Response.status}`);

      if (!s3Response.ok) {
        const errorText = await s3Response.text();
        console.error('S3 upload failed:', s3Response.status, errorText);
        
        // 如果是认证错误，提供更详细的错误信息
        if (s3Response.status === 401 || s3Response.status === 403) {
          return NextResponse.json(
            { 
              error: 'S3 认证失败',
              details: '请检查 GARAGE_S3_ACCESS_KEY_ID 和 GARAGE_S3_SECRET_ACCESS_KEY 环境变量是否正确设置',
              status: s3Response.status,
              rawError: errorText
            },
            { status: s3Response.status }
          );
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to upload file to S3',
            details: errorText,
            status: s3Response.status
          },
          { status: s3Response.status }
        );
      }

      // 获取上传结果
      const etag = s3Response.headers.get('etag');
      
      console.log(`上传成功: 对象键=${objectKey}, ETag=${etag}`);
      
      return NextResponse.json({
        success: true,
        message: 'File uploaded successfully',
        objectKey,
        size: file.size,
        contentType: file.type,
        etag,
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Upload timeout - file too large or network too slow' },
          { status: 408 }
        );
      }
      
      throw fetchError; // 重新抛出给外层 catch
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // 在 Next.js 15 中需要先 await params
  const params = await context.params;
  
  // 获取上传进度或状态的 API
  return NextResponse.json({ 
    message: 'Upload status endpoint',
    bucketId: params.id 
  });
}
