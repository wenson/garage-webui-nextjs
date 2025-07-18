import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface CreateRootKeyRequest {
  name: string;
  globalPermissions?: boolean;
}

export interface CreateRootKeyResponse {
  success: boolean;
  accessKeyId: string;
  secretAccessKey: string;
  name: string;
  globalPermissions?: boolean;
  message?: string;
  warning?: string;
  permissionError?: string;
}

// 创建 Root Key 的钩子
export function useCreateRootKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRootKeyRequest): Promise<CreateRootKeyResponse> => {
      console.log(`创建 Root Key: ${data.name}`);

      // Step 1: 调用 v2/CreateKey API
      const createKeyResponse = await fetch('/api/garage/v2/CreateKey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          neverExpires: true,
          allow: data.globalPermissions ? {
            createBucket: true,
          } : undefined,
        }),
      });

      if (!createKeyResponse.ok) {
        const errorData = await createKeyResponse.json().catch(() => ({ error: '创建密钥失败' }));
        throw new Error(errorData.error || '创建密钥失败');
      }

      const keyData = await createKeyResponse.json();
      
      console.log(`密钥创建成功:`, { 
        accessKeyId: keyData.accessKeyId,
        secretKeyCreated: !!keyData.secretAccessKey 
      });

      // Step 2: 如果需要全局权限，获取所有存储桶并授权
      if (data.globalPermissions) {
        try {
          const bucketsResponse = await fetch('/api/garage/v2/ListBuckets', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (bucketsResponse.ok) {
            const bucketsData = await bucketsResponse.json();
            // ListBuckets 返回的是数组，不是包含 buckets 字段的对象
            const buckets = Array.isArray(bucketsData) ? bucketsData : (bucketsData.buckets || []);
            
            console.log(`为 ${buckets.length} 个桶授予权限`, buckets);
            
            // 为每个现有桶授予权限
            const permissionPromises = buckets.map(async (bucket: { id: string }) => {
              try {
                console.log(`尝试为桶 ${bucket.id} 授予权限，密钥 ID: ${keyData.accessKeyId}`);
                
                const grantResponse = await fetch('/api/garage/v2/AllowBucketKey', {
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
                  console.error(`为桶 ${bucket.id} 授权失败 (${grantResponse.status}):`, errorText);
                  return { bucketId: bucket.id, success: false, error: `${grantResponse.status}: ${errorText}` };
                }
                
                const responseData = await grantResponse.json();
                console.log(`桶 ${bucket.id} 授权成功:`, responseData);
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
              return {
                success: true,
                accessKeyId: keyData.accessKeyId,
                secretAccessKey: keyData.secretAccessKey,
                name: keyData.name,
                globalPermissions: true,
                warning: `密钥创建成功，但 ${failedPermissions.length}/${buckets.length} 个桶授权失败`,
                permissionError: failedPermissions.map(f => f.error).join(', '),
                message: 'Root Key 创建成功（部分权限授予失败）',
              };
            }
            
            console.log(`所有桶权限授予成功`);
          } else {
            console.warn('获取桶列表失败，跳过权限授予');
            return {
              success: true,
              accessKeyId: keyData.accessKeyId,
              secretAccessKey: keyData.secretAccessKey,
              name: keyData.name,
              globalPermissions: false,
              warning: '密钥创建成功，但无法获取桶列表进行权限授予',
              message: 'Root Key 创建成功（权限授予跳过）',
            };
          }
        } catch (error) {
          console.error('权限授予过程出错:', error);
          return {
            success: true,
            accessKeyId: keyData.accessKeyId,
            secretAccessKey: keyData.secretAccessKey,
            name: keyData.name,
            globalPermissions: false,
            warning: '密钥创建成功，但权限授予过程出错',
            message: 'Root Key 创建成功（权限授予失败）',
          };
        }
      }

      return {
        success: true,
        accessKeyId: keyData.accessKeyId,
        secretAccessKey: keyData.secretAccessKey,
        name: keyData.name,
        globalPermissions: data.globalPermissions || false,
        message: '成功创建 Root Key',
      };
    },
    onSuccess: () => {
      // 刷新相关的查询缓存
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });
}

// 获取环境变量中配置的 Root Key（客户端实现）
export function getRootKeyFromEnv(): {
  accessKeyId?: string;
  secretAccessKey?: string;
  isConfigured: boolean;
} {
  // 在客户端，我们无法直接访问服务器环境变量
  // 这里只能检查是否通过其他方式配置了密钥
  
  // 可以通过 localStorage 或其他方式存储配置状态
  const storedConfig = typeof window !== 'undefined' ? 
    localStorage.getItem('garage-root-key-configured') : null;
    
  return {
    isConfigured: storedConfig === 'true',
    // 出于安全考虑，不返回实际的密钥值
  };
}

// 使用 React Query 的环境配置检查
export function useRootKeyConfig() {
  return useQuery({
    queryKey: ['root-key-config'],
    queryFn: () => getRootKeyFromEnv(),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 标记 Root Key 为已配置（在创建成功后调用）
export function markRootKeyAsConfigured() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('garage-root-key-configured', 'true');
  }
}

// 清除 Root Key 配置标记
export function clearRootKeyConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('garage-root-key-configured');
  }
}

// 验证 Root Key 是否有效
export async function validateRootKey(accessKeyId: string): Promise<{
  valid: boolean;
  permissions?: string[];
  error?: string;
}> {
  try {
    // 通过调用 v2/GetKeyInfo 来验证密钥
    const response = await fetch(`/api/garage/v2/GetKeyInfo?id=${accessKeyId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '验证失败' }));
      return {
        valid: false,
        error: errorData.error || '验证失败',
      };
    }

    const keyInfo = await response.json();
    
    // 检查密钥的权限
    const permissions = [];
    if (keyInfo.bucketLocalAlias) {
      permissions.push('桶管理权限');
    }
    if (keyInfo.bucketGlobalAlias) {
      permissions.push('全局桶权限');
    }
    if (keyInfo.permissions) {
      permissions.push('对象操作权限');
    }

    return {
      valid: true,
      permissions,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : '验证过程中发生错误',
    };
  }
}
