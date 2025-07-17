import { GarageBucketInfo } from '@/types';

/**
 * 从桶信息中获取有写入权限的密钥
 */
export function getWritableKeyFromBucket(bucketInfo: GarageBucketInfo): { accessKeyId: string; secretAccessKey?: string } | null {
  if (!bucketInfo.keys || bucketInfo.keys.length === 0) {
    console.warn('存储桶没有关联的密钥');
    return null;
  }

  // 查找有写入权限的密钥
  const writableKey = bucketInfo.keys.find(keyPermission => 
    keyPermission.permissions.write || keyPermission.permissions.owner
  );

  if (!writableKey) {
    console.warn('存储桶没有具有写入权限的密钥');
    return null;
  }

  // 注意：从桶信息获取的密钥权限只有 bucketId，没有完整的密钥信息
  // 需要通过 API 获取完整的密钥信息
  return {
    accessKeyId: writableKey.bucketId, // 这里可能需要调整，取决于 API 返回的实际字段
    secretAccessKey: undefined // 需要通过其他方式获取
  };
}

/**
 * 获取当前桶的可用密钥进行上传
 * 优先级：环境变量 > 桶关联的密钥
 */
export function getUploadCredentials(bucketInfo?: GarageBucketInfo): {
  accessKeyId?: string;
  secretAccessKey?: string;
  source: 'env' | 'bucket' | 'none';
} {
  // 1. 优先使用环境变量配置的密钥
  const envAccessKeyId = process.env.GARAGE_S3_ACCESS_KEY_ID;
  const envSecretAccessKey = process.env.GARAGE_S3_SECRET_ACCESS_KEY;
  
  if (envAccessKeyId && envSecretAccessKey) {
    return {
      accessKeyId: envAccessKeyId,
      secretAccessKey: envSecretAccessKey,
      source: 'env'
    };
  }

  // 2. 尝试使用桶关联的密钥
  if (bucketInfo) {
    const bucketKey = getWritableKeyFromBucket(bucketInfo);
    if (bucketKey && bucketKey.accessKeyId) {
      return {
        accessKeyId: bucketKey.accessKeyId,
        secretAccessKey: bucketKey.secretAccessKey,
        source: 'bucket'
      };
    }
  }

  // 3. 没有可用的密钥
  return {
    source: 'none'
  };
}

/**
 * 检查是否需要获取完整的密钥信息
 */
export function needsKeyDetails(credentials: ReturnType<typeof getUploadCredentials>): boolean {
  return credentials.source === 'bucket' && !credentials.secretAccessKey;
}
