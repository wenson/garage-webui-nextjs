"use client";

import { useState } from "react";
import { useKeys, useCreateKey, useDeleteKey } from "@/hooks/api";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";
import { garageAPIv2 } from "@/lib/garage-api-v2";
import { ErrorMessage } from "@/components/ui/error-message";
import { PermissionDialog } from "@/components/keys/permission-dialog";
import { BucketBindingDialog } from "@/components/keys/bucket-binding-dialog";
import { KeysPageHeader } from "@/components/keys/keys-page-header";
import { KeysSearchBar } from "@/components/keys/keys-search-bar";
import { CreateKeyForm } from "@/components/keys/create-key-form";
import { KeysList } from "@/components/keys/keys-list";

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
  const [requestedSecrets, setRequestedSecrets] = useState<Set<string>>(new Set());
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

  const handleManageBucketBindings = async (key: ActualKeyData) => {
    setSelectedKeyForPermissions(key);
    setShowBucketBindingDialog(true);
    
    // 获取密钥的详细信息
    try {
      const keyId = key.id || key.accessKeyId;
      if (keyId) {
        console.log('Fetching key details for bucket bindings:', keyId);
        const detailedInfo = await garageAPIv2.getKeyInfo({ id: keyId });
        console.log('Key detailed info for bindings:', detailedInfo);
        setKeyDetailedInfo(detailedInfo);
      }
    } catch (error) {
      console.error('Failed to fetch key details for bindings:', error);
    }

    // 获取可用的存储桶列表
    try {
      const buckets = await garageAPIv2.listBuckets();
      setAvailableBuckets(buckets);
    } catch (error) {
      console.error('Failed to fetch buckets for bindings:', error);
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
      <KeysPageHeader onCreateKey={() => setShowCreateForm(true)} />

      {/* 搜索栏 */}
      <KeysSearchBar 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={keys?.length || 0}
      />

      {/* 创建密钥表单 */}
      <CreateKeyForm
        isVisible={showCreateForm}
        keyName={newKeyName}
        isCreating={isCreating}
        onKeyNameChange={setNewKeyName}
        onCreateKey={handleCreateKey}
        onCancel={() => {
          setShowCreateForm(false);
          setNewKeyName("");
        }}
      />

      {/* 密钥列表 */}
      <KeysList
        keys={filteredKeys}
        searchTerm={searchTerm}
        visibleSecrets={visibleSecrets}
        setVisibleSecrets={setVisibleSecrets}
        requestedSecrets={requestedSecrets}
        setRequestedSecrets={setRequestedSecrets}
        onDeleteKey={handleDeleteKey}
        onEditPermissions={handleManagePermissions}
        onManageBucketBindings={handleManageBucketBindings}
        onShowCreateForm={() => setShowCreateForm(true)}
        copyToClipboard={copyToClipboard}
      />

      {/* 权限管理对话框 */}
      <PermissionDialog
        isOpen={showPermissionDialog}
        selectedKey={selectedKeyForPermissions}
        keyDetailedInfo={keyDetailedInfo}
        tempPermissions={tempPermissions}
        isSavingPermissions={isSavingPermissions}
        onClose={() => {
          setShowPermissionDialog(false);
          setSelectedKeyForPermissions(null);
          setKeyDetailedInfo(null);
          setTempPermissions({});
        }}
        onShowBucketBindingDialog={() => setShowBucketBindingDialog(true)}
        onGlobalPermissionChange={handleGlobalPermissionChange}
      />

      {/* 存储桶绑定对话框 */}
      <BucketBindingDialog
        isOpen={showBucketBindingDialog}
        selectedKey={selectedKeyForPermissions}
        allBuckets={availableBuckets.map(bucket => ({
          id: bucket.id,
          aliases: bucket.globalAliases || [],
          objects: 0,
          bytes: 0,
          unfinishedUploads: 0,
          quotas: {}
        }))}
        isLoadingBuckets={false}
        isSavingPermissions={isSavingPermissions}
        onClose={() => setShowBucketBindingDialog(false)}
        onBucketPermissionChange={handleBucketPermissionChange}
      />
    </div>
  );
}
