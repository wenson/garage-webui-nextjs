/**
 * 自动获取 Root Key 认证信息的工具函数
 */

interface RootKeyCredentials {
  accessKeyId: string;
  secretAccessKey: string;
}

let cachedRootKey: RootKeyCredentials | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 缓存5分钟

/**
 * 获取 Root Key 的 S3 认证信息
 * 支持缓存，避免频繁调用 API
 */
export async function getRootKeyCredentials(): Promise<RootKeyCredentials | null> {
  const now = Date.now();
  
  // 如果有缓存且未过期，直接返回
  if (cachedRootKey && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedRootKey;
  }

  try {
    const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
    const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

    // 获取所有访问密钥
    const keysUrl = new URL(`${GARAGE_API_BASE_URL}/v2/ListKeys`);
    const keysResponse = await fetch(keysUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!keysResponse.ok) {
      console.error('获取密钥列表失败:', keysResponse.status);
      return null;
    }

    const keysData = await keysResponse.json();
    const keys = Array.isArray(keysData) ? keysData : [];

    // 查找 Root Key
    for (const keyId of keys) {
      try {
        const keyInfoUrl = new URL(`${GARAGE_API_BASE_URL}/v2/GetKeyInfo`);
        keyInfoUrl.searchParams.set('id', keyId);
        
        const keyInfoResponse = await fetch(keyInfoUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (keyInfoResponse.ok) {
          const keyInfo = await keyInfoResponse.json();
          
          // 检查是否为 Root Key (全局权限 - buckets 权限为空对象)
          if (keyInfo.permissions?.buckets && 
              Object.keys(keyInfo.permissions.buckets).length === 0) {
            
            const credentials = {
              accessKeyId: keyInfo.accessKeyId,
              secretAccessKey: keyInfo.secretAccessKey
            };

            // 缓存结果
            cachedRootKey = credentials;
            lastFetchTime = now;
            
            console.log(`找到 Root Key: ${credentials.accessKeyId}`);
            return credentials;
          }
        }
      } catch (keyError) {
        console.error(`获取密钥信息失败 ${keyId}:`, keyError);
      }
    }

    console.warn('未找到 Root Key');
    return null;

  } catch (error) {
    console.error('获取 Root Key 失败:', error);
    return null;
  }
}

/**
 * 清除 Root Key 缓存（当需要强制刷新时使用）
 */
export function clearRootKeyCache() {
  cachedRootKey = null;
  lastFetchTime = 0;
}

/**
 * 检查是否有有效的 Root Key
 */
export async function hasValidRootKey(): Promise<boolean> {
  const credentials = await getRootKeyCredentials();
  return credentials !== null;
}
