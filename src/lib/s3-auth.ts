import { createHmac } from 'crypto';

export interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  bucket: string;
}

export function generateS3AuthHeaders(
  method: string,
  url: string,
  contentType: string,
  contentLength: number,
  config: S3Config
): Record<string, string> {
  const date = new Date().toUTCString();
  const urlObj = new URL(url);
  const resource = urlObj.pathname;
  
  // 构建待签名的字符串
  const stringToSign = [
    method,
    '', // Content-MD5 (可选)
    contentType,
    date,
    resource
  ].join('\n');
  
  // 生成签名
  const signature = createHmac('sha1', config.secretAccessKey)
    .update(stringToSign)
    .digest('base64');
  
  const authorization = `AWS ${config.accessKeyId}:${signature}`;
  
  return {
    'Authorization': authorization,
    'Date': date,
    'Content-Type': contentType,
    'Content-Length': contentLength.toString(),
  };
}

export function getS3Config(): S3Config | null {
  const accessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.GARAGE_S3_SECRET_ACCESS_KEY;
  const endpoint = process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900';
  
  if (!accessKeyId || !secretAccessKey) {
    console.warn('缺少 S3 认证配置: GARAGE_S3_ACCESS_KEY_ID 或 GARAGE_S3_SECRET_ACCESS_KEY');
    return null;
  }
  
  return {
    accessKeyId,
    secretAccessKey,
    endpoint,
    bucket: '', // 将在使用时设置
  };
}
