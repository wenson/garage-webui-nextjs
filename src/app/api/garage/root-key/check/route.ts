import { NextResponse } from 'next/server';

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
