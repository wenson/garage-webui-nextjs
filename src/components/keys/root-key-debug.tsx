"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { 
  Shield, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Key,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface BucketPermission {
  bucketId: string;
  bucketName?: string;
  hasPermission: boolean;
  permissions?: {
    read?: boolean;
    write?: boolean;
    owner?: boolean;
  };
  error?: string;
}

interface RootKeyDebugInfo {
  keyExists: boolean;
  keyId?: string;
  bucketsTotal: number;
  bucketsWithPermission: number;
  bucketPermissions: BucketPermission[];
  error?: string;
}

export function RootKeyDebug() {
  const [debugInfo, setDebugInfo] = useState<RootKeyDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkRootKeyPermissions = async () => {
    setIsLoading(true);
    try {
      // 1. 获取所有密钥，查找 Root Key
      const keysResponse = await fetch('/api/garage/v2/ListKeys');
      if (!keysResponse.ok) {
        throw new Error('无法获取密钥列表');
      }
      
      const keysData = await keysResponse.json();
      // ListKeys 返回的是数组，不是包含 keys 字段的对象
      const keys = Array.isArray(keysData) ? keysData : (keysData.keys || []);
      
      console.log('获取到密钥列表:', keys);

      // 2. 检查每个密钥的详细信息，查找有 createBucket 权限的密钥
      const rootKeys = [];
      
      for (const key of keys) {
        try {
          const keyId = key.id || key.accessKeyId || '';
          if (!keyId) continue;
          
          const keyInfoResponse = await fetch(`/api/garage/v2/GetKeyInfo?id=${keyId}`);
          if (keyInfoResponse.ok) {
            const keyInfo = await keyInfoResponse.json();
            console.log(`密钥 ${keyId} 的详细信息:`, keyInfo);
            
            // 检查是否有 createBucket 权限
            if (keyInfo.permissions?.createBucket === true) {
              rootKeys.push({
                ...keyInfo,
                id: keyId,
                accessKeyId: keyInfo.accessKeyId || keyId
              });
            }
          }
        } catch (error) {
          console.warn(`获取密钥 ${key.id} 详细信息失败:`, error);
        }
      }

      console.log('找到的 Root Keys:', rootKeys);

      if (rootKeys.length === 0) {
        console.warn('未找到 Root Key，所有密钥的权限状态:', 
          keys.map((key: { id?: string; name?: string }) => ({ 
            id: key.id, 
            name: key.name,
            hasPermissionsChecked: true 
          }))
        );
        setDebugInfo({
          keyExists: false,
          bucketsTotal: 0,
          bucketsWithPermission: 0,
          bucketPermissions: [],
          error: `未找到 Root Key。检查的 ${keys.length} 个密钥中，没有一个具有 createBucket 权限。请先创建 Root Key。`
        });
        setIsLoading(false);
        return;
      }

      const rootKey = rootKeys[0]; // 取第一个 Root Key
      const rootKeyId = rootKey.id || rootKey.accessKeyId || '';
      console.log('选择的 Root Key:', rootKey);

      // 3. 获取所有存储桶
      const bucketsResponse = await fetch('/api/garage/v2/ListBuckets');
      if (!bucketsResponse.ok) {
        throw new Error('无法获取存储桶列表');
      }

      const bucketsData = await bucketsResponse.json();
      // ListBuckets 返回的是数组，不是包含 buckets 字段的对象
      const buckets = Array.isArray(bucketsData) ? bucketsData : (bucketsData.buckets || []);

      // 4. 检查每个存储桶的权限
      const bucketPermissions: BucketPermission[] = [];
      let bucketsWithPermission = 0;

      for (const bucket of buckets) {
        try {
          // 获取存储桶的详细信息，包括权限
          const bucketInfoResponse = await fetch(`/api/garage/v2/GetBucketInfo?id=${bucket.id}`);
          
          if (bucketInfoResponse.ok) {
            const bucketInfo = await bucketInfoResponse.json();
            
            // 查找 Root Key 在这个存储桶中的权限
            const keyPermission = bucketInfo.keys?.find((k: { 
              accessKeyId?: string; 
              permissions?: { read?: boolean; write?: boolean; owner?: boolean } 
            }) => 
              k.accessKeyId === rootKeyId
            );

            if (keyPermission) {
              bucketPermissions.push({
                bucketId: bucket.id,
                bucketName: bucketInfo.globalAliases?.[0] || bucket.id,
                hasPermission: true,
                permissions: keyPermission.permissions
              });
              bucketsWithPermission++;
            } else {
              bucketPermissions.push({
                bucketId: bucket.id,
                bucketName: bucketInfo.globalAliases?.[0] || bucket.id,
                hasPermission: false,
                error: '未找到密钥权限'
              });
            }
          } else {
            bucketPermissions.push({
              bucketId: bucket.id,
              hasPermission: false,
              error: '无法获取存储桶信息'
            });
          }
        } catch (error) {
          bucketPermissions.push({
            bucketId: bucket.id,
            hasPermission: false,
            error: error instanceof Error ? error.message : '检查权限时出错'
          });
        }
      }

      setDebugInfo({
        keyExists: true,
        keyId: rootKeyId,
        bucketsTotal: buckets.length,
        bucketsWithPermission,
        bucketPermissions
      });

    } catch (error) {
      console.error('检查 Root Key 权限失败:', error);
      setDebugInfo({
        keyExists: false,
        bucketsTotal: 0,
        bucketsWithPermission: 0,
        bucketPermissions: [],
        error: error instanceof Error ? error.message : '检查失败'
      });
      toast.error('检查 Root Key 权限失败');
    }
    setIsLoading(false);
  };

  const fixMissingPermissions = async () => {
    if (!debugInfo || !debugInfo.keyExists || !debugInfo.keyId) {
      toast.error('未找到 Root Key');
      return;
    }

    const missingPermissions = debugInfo.bucketPermissions.filter(bp => !bp.hasPermission);
    if (missingPermissions.length === 0) {
      toast.info('所有存储桶权限已正确配置');
      return;
    }

    setIsLoading(true);
    try {
      const fixPromises = missingPermissions.map(async (bucket) => {
        try {
          const grantResponse = await fetch('/api/garage/v2/AllowBucketKey', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bucketId: bucket.bucketId,
              accessKeyId: debugInfo.keyId,
              permissions: {
                read: true,
                write: true,
                owner: true,
              },
            }),
          });

          if (!grantResponse.ok) {
            const errorText = await grantResponse.text();
            throw new Error(`授权失败: ${errorText}`);
          }

          return { bucketId: bucket.bucketId, success: true };
        } catch (error) {
          return { 
            bucketId: bucket.bucketId, 
            success: false, 
            error: error instanceof Error ? error.message : '未知错误' 
          };
        }
      });

      const results = await Promise.all(fixPromises);
      const failed = results.filter(r => !r.success);

      if (failed.length === 0) {
        toast.success(`成功为 ${results.length} 个存储桶授予权限`);
        // 重新检查权限状态
        await checkRootKeyPermissions();
      } else {
        toast.warning(`${results.length - failed.length}/${results.length} 个存储桶权限修复成功`);
      }

    } catch (error) {
      console.error('修复权限失败:', error);
      toast.error('修复权限失败');
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <CardTitle>Root Key 权限诊断</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkRootKeyPermissions}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            刷新检查
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!debugInfo ? (
          <div className="text-center py-8">
            <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">点击&ldquo;刷新检查&rdquo;来诊断 Root Key 权限状态</p>
            <Button onClick={checkRootKeyPermissions} disabled={isLoading}>
              开始检查
            </Button>
          </div>
        ) : (
          <>
            {/* Root Key 状态 */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {debugInfo.keyExists ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {debugInfo.keyExists ? 'Root Key 存在' : 'Root Key 不存在'}
                  </p>
                  {debugInfo.keyId && (
                    <p className="text-sm text-gray-500">ID: {debugInfo.keyId}</p>
                  )}
                  {debugInfo.error && (
                    <p className="text-sm text-red-500">错误: {debugInfo.error}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 权限概览 */}
            {debugInfo.keyExists && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 border rounded-lg text-center">
                  <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{debugInfo.bucketsTotal}</p>
                  <p className="text-sm text-gray-500">总存储桶数</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{debugInfo.bucketsWithPermission}</p>
                  <p className="text-sm text-gray-500">有权限的桶</p>
                </div>
                <div className="p-3 border rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{debugInfo.bucketsTotal - debugInfo.bucketsWithPermission}</p>
                  <p className="text-sm text-gray-500">缺少权限的桶</p>
                </div>
              </div>
            )}

            {/* 修复按钮 */}
            {debugInfo.keyExists && debugInfo.bucketsWithPermission < debugInfo.bucketsTotal && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="text-amber-800 dark:text-amber-200">
                      发现 {debugInfo.bucketsTotal - debugInfo.bucketsWithPermission} 个存储桶缺少 Root Key 权限
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fixMissingPermissions}
                    disabled={isLoading}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    修复权限
                  </Button>
                </div>
              </div>
            )}

            {/* 详细权限列表 */}
            {debugInfo.bucketPermissions.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">存储桶权限详情</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {debugInfo.bucketPermissions.map((bucket) => (
                    <div 
                      key={bucket.bucketId} 
                      className="flex items-center justify-between p-2 border rounded text-sm"
                    >
                      <div className="flex items-center space-x-2">
                        {bucket.hasPermission ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-mono">
                          {bucket.bucketName || bucket.bucketId}
                        </span>
                      </div>
                      <div className="text-gray-500">
                        {bucket.hasPermission ? (
                          <span className="text-green-600">
                            读:{bucket.permissions?.read ? '✓' : '✗'} 
                            写:{bucket.permissions?.write ? '✓' : '✗'} 
                            管理:{bucket.permissions?.owner ? '✓' : '✗'}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {bucket.error || '无权限'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RootKeyDebug;
