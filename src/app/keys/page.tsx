"use client";

import { useState } from "react";
import { useKeys, useCreateKey, useDeleteKey } from "@/hooks/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { 
  Key, 
  Plus, 
  Trash2, 
  Search,
  Copy,
  Eye,
  EyeOff,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { garageAPIv2 } from "@/lib/garage-api-v2";
import { ErrorMessage } from "@/components/ui/error-message";

// 定义实际的API响应类型
interface ActualKeyData {
  id?: string;
  accessKeyId?: string; // API 返回的字段名
  name?: string;
  created: string;
  expiration?: string | null;
  expired: boolean;
  permissions?: {
    createBucket?: boolean;
  };
  secretAccessKey?: string;
}

interface KeyDetailedInfo {
  accessKeyId: string;
  name: string;
  expired: boolean;
  permissions: {
    createBucket?: boolean;
  };
  buckets: Array<{
    id: string;
    globalAliases?: string[];
    localAliases?: string[];
    permissions?: {
      read?: boolean;
      write?: boolean;
      owner?: boolean;
    };
  }>;
}

interface AvailableBucket {
  id: string;
  globalAliases: string[];
  localAliases: Array<{
    accessKeyId: string;
    alias: string;
  }>;
}

export default function KeysPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedKeyForPermissions, setSelectedKeyForPermissions] = useState<ActualKeyData | null>(null);
  const [keyDetailedInfo, setKeyDetailedInfo] = useState<KeyDetailedInfo | null>(null);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [availableBuckets, setAvailableBuckets] = useState<AvailableBucket[]>([]);
  const [showBucketBindingDialog, setShowBucketBindingDialog] = useState(false);
  const [tempPermissions, setTempPermissions] = useState<Record<string, boolean>>({});

  const { data: keys, isLoading, error, refetch } = useKeys();
  const createKey = useCreateKey();
  const deleteKey = useDeleteKey();

  const filteredKeys = keys?.filter(key => {
    const actualKey = key as unknown as ActualKeyData;
    const keyId = actualKey.id || actualKey.accessKeyId || '';
    return keyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (key.name && key.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }) || [];

  const handleCreateKey = async () => {
    setIsCreating(true);
    try {
      const result = await createKey.mutateAsync({
        name: newKeyName.trim() || undefined
      });
      toast.success("访问密钥创建成功");
      setNewKeyName("");
      setShowCreateForm(false);
      refetch();
      
      // 显示新创建的密钥信息
      if (result.accessKeyId) {
        toast.info(`密钥 ID: ${result.accessKeyId}`);
      }
    } catch (error) {
      // 全局错误处理会显示具体的错误信息
      console.error("Error creating key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string, keyName?: string) => {
    const displayName = keyName || keyId;
    if (!confirm(`确定要删除访问密钥 "${displayName}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await deleteKey.mutateAsync(keyId);
      toast.success("访问密钥删除成功");
      refetch();
    } catch (error) {
      // 全局错误处理会显示具体的错误信息
      console.error("Error deleting key:", error);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label}已复制到剪贴板`);
    } catch {
      toast.error("复制失败");
    }
  };

  const toggleSecretVisibility = (keyId: string) => {
    const newVisible = new Set(visibleSecrets);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleSecrets(newVisible);
  };

  const handleManagePermissions = async (key: ActualKeyData) => {
    setSelectedKeyForPermissions(key);
    setShowPermissionDialog(true);
    
    // 获取密钥的详细信息
    try {
      const keyId = key.id || key.accessKeyId;
      if (keyId) {
        console.log('Fetching key details for:', keyId);
        const detailedInfo = await garageAPIv2.getKeyInfo({ id: keyId });
        console.log('Key detailed info:', detailedInfo);
        setKeyDetailedInfo(detailedInfo);
      }
    } catch (error) {
      console.error('Failed to fetch key details:', error);
    }

    // 获取可用的存储桶列表
    try {
      const buckets = await garageAPIv2.listBuckets();
      setAvailableBuckets(buckets);
    } catch (error) {
      console.error('Failed to fetch buckets:', error);
    }
  };

  const handleGlobalPermissionChange = async (permission: string, enabled: boolean) => {
    if (!selectedKeyForPermissions) return;
    
    // 立即更新临时状态以提供即时视觉反馈
    setTempPermissions(prev => ({
      ...prev,
      [permission]: enabled
    }));
    
    setIsSavingPermissions(true);
    try {
      const keyId = selectedKeyForPermissions.id || selectedKeyForPermissions.accessKeyId;
      if (!keyId) throw new Error('密钥 ID 不存在');
      
      console.log('Updating permission:', { keyId, permission, enabled });
      
      await garageAPIv2.updateKey(keyId, {
        allow: enabled ? { [permission]: true } : null,
        deny: !enabled ? { [permission]: true } : null,
      });

      console.log('Permission update successful, refreshing data...');
      toast.success('权限更新成功');
      
      // 立即刷新数据以确保UI更新
      await refetch();
      
      // 更新本地权限弹窗状态
      setSelectedKeyForPermissions(prev => prev ? {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: enabled
        }
      } : null);
      
      // 同时更新详细信息状态
      setKeyDetailedInfo(prev => prev ? {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: enabled
        }
      } : null);
      
      // 清除临时状态
      setTempPermissions(prev => {
        const newTemp = { ...prev };
        delete newTemp[permission];
        return newTemp;
      });
      
      console.log('Data refresh completed');
      
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast.error('权限更新失败');
      
      // 回滚临时状态
      setTempPermissions(prev => {
        const newTemp = { ...prev };
        delete newTemp[permission];
        return newTemp;
      });
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleBucketPermissionChange = async (bucketId: string, permission: string, enabled: boolean) => {
    if (!selectedKeyForPermissions) return;
    
    setIsSavingPermissions(true);
    try {
      const keyId = selectedKeyForPermissions.id || selectedKeyForPermissions.accessKeyId;
      if (!keyId) throw new Error('密钥 ID 不存在');
      
      if (enabled) {
        await garageAPIv2.allowBucketKey({
          bucketId,
          accessKeyId: keyId,
          permissions: {
            [permission]: true
          }
        });
      } else {
        await garageAPIv2.denyBucketKey({
          bucketId,
          accessKeyId: keyId,
          permissions: {
            [permission]: true
          }
        });
      }

      toast.success(`存储桶权限${enabled ? '授予' : '撤销'}成功`);
      // 重新获取密钥详细信息
      const updatedKeyInfo = await garageAPIv2.getKeyInfo({ id: keyId });
      setKeyDetailedInfo(updatedKeyInfo);
    } catch (error) {
      console.error('Error updating bucket permissions:', error);
      toast.error(`存储桶权限${enabled ? '授予' : '撤销'}失败`);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载访问密钥..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              访问密钥管理
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              管理您的 S3 API 访问密钥
            </p>
          </div>
        </div>
        
        <ErrorMessage 
          title="无法加载访问密钥列表"
          message={error instanceof Error ? error.message : '未知错误'}
          error={error}
          onRetry={() => refetch()}
          showConfigHint={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            访问密钥管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            管理 S3 API 访问密钥和权限
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建密钥
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索访问密钥..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          共 {keys?.length || 0} 个密钥
        </div>
      </div>

      {/* 创建密钥表单 */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              创建新访问密钥
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  密钥名称 (可选)
                </label>
                <Input
                  placeholder="输入密钥名称..."
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateKey()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  为密钥设置一个易于识别的名称
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateKey}
                  disabled={isCreating}
                >
                  {isCreating ? "创建中..." : "创建"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewKeyName("");
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 密钥列表 */}
      <div className="space-y-4">
        {filteredKeys.length > 0 ? (
          filteredKeys.map((key, index) => {
            const actualKey = key as unknown as ActualKeyData;
            const keyId = actualKey.id || actualKey.accessKeyId || `key-${index}`;
            const isSecretVisible = visibleSecrets.has(keyId);
            const hasSecretKey = actualKey.secretAccessKey && actualKey.secretAccessKey.length > 0;
            
            return (
              <Card key={keyId} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <Key className="h-5 w-5 text-blue-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {actualKey.name || "未命名密钥"}
                        </CardTitle>
                        <p className="text-sm text-gray-500 font-mono">
                          {keyId}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {actualKey.permissions?.createBucket ? "可创建存储桶" : "受限权限"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* 密钥信息 */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-sm font-medium">Access Key ID:</label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(keyId, "Access Key ID")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {keyId}
                        </p>
                      </div>
                      
                      {hasSecretKey && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">Secret Access Key:</label>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(keyId)}
                              >
                                {isSecretVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(actualKey.secretAccessKey!, "Secret Access Key")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {isSecretVisible ? actualKey.secretAccessKey : "•".repeat(actualKey.secretAccessKey!.length)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 权限信息 */}
                    <div>
                      <div className="flex items-center mb-2">
                        <Shield className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">权限设置:</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <span className="text-sm">创建存储桶权限:</span>
                          <Badge variant={actualKey.permissions?.createBucket ? "default" : "secondary"}>
                            {actualKey.permissions?.createBucket ? "允许" : "禁止"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-between pt-3 border-t">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleManagePermissions(actualKey)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        管理权限
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteKey(keyId, actualKey.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? "未找到匹配的密钥" : "暂无访问密钥"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? "尝试使用其他关键词搜索" : "创建您的第一个访问密钥以开始使用 S3 API"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建访问密钥
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* 权限管理对话框 */}
      {showPermissionDialog && selectedKeyForPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                权限管理 - {selectedKeyForPermissions.name || "未命名密钥"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowPermissionDialog(false);
                  setSelectedKeyForPermissions(null);
                  setTempPermissions({});
                }}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              {/* 密钥基本信息 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-medium mb-2">密钥信息</h3>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">ID:</span> {keyDetailedInfo?.accessKeyId || selectedKeyForPermissions.id || selectedKeyForPermissions.accessKeyId}</div>
                  <div><span className="font-medium">名称:</span> {keyDetailedInfo?.name || selectedKeyForPermissions.name || "未命名"}</div>
                  <div><span className="font-medium">创建时间:</span> {new Date(selectedKeyForPermissions.created).toLocaleString()}</div>
                  <div><span className="font-medium">状态:</span> {keyDetailedInfo?.expired !== undefined ? (keyDetailedInfo.expired ? "已过期" : "有效") : (selectedKeyForPermissions.expired ? "已过期" : "有效")}</div>
                </div>
              </div>

              {/* 全局权限设置 */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 dark:text-white">全局权限</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">创建存储桶权限</div>
                      <div className="text-sm text-gray-500">允许此密钥创建新的存储桶</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={
                          tempPermissions.hasOwnProperty('createBucket') 
                            ? tempPermissions.createBucket 
                            : (keyDetailedInfo?.permissions?.createBucket ?? selectedKeyForPermissions.permissions?.createBucket ?? false)
                        }
                        onChange={(e) => handleGlobalPermissionChange('createBucket', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* 存储桶权限列表 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-white">存储桶权限</h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBucketBindingDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    绑定存储桶
                  </Button>
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  此密钥对以下存储桶具有访问权限：
                </div>
                <div className="space-y-2">
                  {keyDetailedInfo?.buckets && keyDetailedInfo.buckets.length > 0 ? (
                    keyDetailedInfo.buckets.map((bucket, index: number) => (
                      <div key={bucket.id || index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium">{bucket.globalAliases?.[0] || bucket.id}</div>
                            <div className="text-sm text-gray-500">ID: {bucket.id}</div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={bucket.permissions?.read ? "default" : "secondary"}>
                              {bucket.permissions?.read ? "可读" : "禁读"}
                            </Badge>
                            <Badge variant={bucket.permissions?.write ? "default" : "secondary"}>
                              {bucket.permissions?.write ? "可写" : "禁写"}
                            </Badge>
                            <Badge variant={bucket.permissions?.owner ? "default" : "secondary"}>
                              {bucket.permissions?.owner ? "所有者" : "非所有者"}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          本地别名: {bucket.localAliases?.join(', ') || '无'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-700 dark:text-blue-300 text-center space-y-2">
                        <div className="font-medium">
                          {keyDetailedInfo ? "此密钥暂未分配特定存储桶权限" : "正在加载存储桶权限信息..."}
                        </div>
                        {keyDetailedInfo && (
                          <div className="text-xs">
                            该密钥目前只有全局权限（如创建存储桶），如需访问特定存储桶，请为其分配存储桶级别的权限。
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowPermissionDialog(false);
                    setSelectedKeyForPermissions(null);
                    setKeyDetailedInfo(null);
                    setTempPermissions({});
                  }}
                >
                  关闭
                </Button>
                <Button 
                  disabled={isSavingPermissions}
                  onClick={() => {
                    setShowPermissionDialog(false);
                    setSelectedKeyForPermissions(null);
                    setKeyDetailedInfo(null);
                    setTempPermissions({});
                    toast.success('权限设置已保存');
                  }}
                >
                  {isSavingPermissions ? '保存中...' : '保存更改'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 存储桶绑定对话框 */}
      {showBucketBindingDialog && selectedKeyForPermissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                绑定存储桶权限
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBucketBindingDialog(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                为密钥 &quot;{selectedKeyForPermissions.name || "未命名密钥"}&quot; 选择要绑定的存储桶和权限类型：
              </div>

              {availableBuckets.length > 0 ? (
                <div className="space-y-3">
                  {availableBuckets.map((bucket) => {
                    // 检查密钥是否已经有此存储桶的权限
                    const existingPermission = keyDetailedInfo?.buckets?.find(b => b.id === bucket.id);
                    
                    return (
                      <div key={bucket.id} className="p-3 border rounded-lg">
                        <div className="font-medium mb-2">
                          {bucket.globalAliases?.[0] || bucket.id}
                        </div>
                        <div className="text-xs text-gray-500 mb-3">
                          ID: {bucket.id}
                        </div>
                        
                        {existingPermission ? (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            ✓ 已绑定此存储桶
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleBucketPermissionChange(bucket.id, 'read', true)}
                              disabled={isSavingPermissions}
                            >
                              授予读权限
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleBucketPermissionChange(bucket.id, 'write', true)}
                              disabled={isSavingPermissions}
                            >
                              授予写权限
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleBucketPermissionChange(bucket.id, 'owner', true)}
                              disabled={isSavingPermissions}
                            >
                              授予所有者权限
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-2">暂无可用的存储桶</div>
                  <div className="text-sm text-gray-400">
                    请先创建存储桶，然后再为密钥分配权限
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setShowBucketBindingDialog(false)}
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
