import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

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
        { error: 'Missing required parameters: file, objectKey, or bucketName' },
        { status: 400 }
      );
    }

    // 确定使用哪个 S3 认证
    let accessKeyId: string;
    let secretAccessKey: string;
    
    if (uploadAccessKeyId && uploadSecretAccessKey) {
      // 使用前端提供的密钥
      accessKeyId = uploadAccessKeyId;
      secretAccessKey = uploadSecretAccessKey;
    } else {
      // 使用环境变量
      accessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID || '';
      secretAccessKey = process.env.GARAGE_S3_SECRET_ACCESS_KEY || '';
    }

    if (!accessKeyId || !secretAccessKey) {
      console.error('缺少 S3 认证信息');
      return NextResponse.json(
        { error: 'Missing S3 credentials' },
        { status: 401 }
      );
    }

    // 创建 S3 客户端
    const s3EndpointUrl = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900';
    const s3Client = new S3Client({
      endpoint: s3EndpointUrl,
      region: 'garage', // 使用garage作为区域
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
      serviceId: 's3',
    });

    console.log(`使用 S3 SDK 上传到: ${s3EndpointUrl}/${bucketName}/${objectKey}`);

    // 将文件转换为 Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 创建上传命令
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: fileBuffer,
      ContentType: file.type || 'application/octet-stream',
      ContentLength: file.size,
    });

    // 执行上传
    const response = await s3Client.send(command);
    
    console.log(`上传成功: ETag=${response.ETag}`);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      objectKey,
      size: file.size,
      contentType: file.type,
      etag: response.ETag,
    });

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
