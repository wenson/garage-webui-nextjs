'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { X, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { toast } from 'sonner';

// 从主页面导入的类型定义
interface BucketInfo {
  id: string;
  aliases?: string[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  quotas: {
    maxSize?: number;
    maxObjects?: number;
  };
  websiteConfig?: {
    indexDocument?: string;
    errorDocument?: string;
  };
}

interface ActualKeyData {
  id?: string;
  accessKeyId?: string;
  name?: string;
  created: string;
  expiration?: string | null;
  expired: boolean;
  permissions?: {
    createBucket?: boolean;
  };
  secretAccessKey?: string;
}

interface GarageApiError extends Error {
  message: string;
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

interface BucketBindingDialogProps {
  isOpen: boolean;
  selectedKey: ActualKeyData | null;
  keyDetailedInfo: KeyDetailedInfo | null;
  allBuckets: BucketInfo[];
  isLoadingBuckets: boolean;
  isSavingPermissions: boolean;
  onClose: () => void;
  onBucketPermissionChange: (bucketId: string, permission: 'read' | 'write' | 'owner', enabled: boolean) => Promise<void>;
}

export function BucketBindingDialog({
  isOpen,
  selectedKey,
  keyDetailedInfo,
  allBuckets,
  isLoadingBuckets,
  isSavingPermissions,
  onClose,
  onBucketPermissionChange
}: BucketBindingDialogProps) {
  const [expandedBuckets, setExpandedBuckets] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleBucketToggle = (bucketId: string) => {
    const newExpanded = new Set(expandedBuckets);
    if (newExpanded.has(bucketId)) {
      newExpanded.delete(bucketId);
    } else {
      newExpanded.add(bucketId);
    }
    setExpandedBuckets(newExpanded);
  };

  const handlePermissionChange = async (bucketId: string, permission: 'read' | 'write' | 'owner', enabled: boolean) => {
    try {
      await onBucketPermissionChange(bucketId, permission, enabled);
    } catch (error) {
      const apiError = error as GarageApiError;
      toast.error(`设置权限失败: ${apiError.message || '未知错误'}`);
    }
  };

  const isKeyLinkedToBucket = (bucketId: string) => {
    if (!keyDetailedInfo) return false;
    // 检查密钥的存储桶列表中是否包含这个存储桶
    return keyDetailedInfo.buckets.some(bucket => bucket.id === bucketId);
  };

  const getKeyPermissionsForBucket = (bucketId: string): Record<string, boolean> => {
    if (!keyDetailedInfo) return {};
    
    // 查找这个存储桶的权限
    const bucketInfo = keyDetailedInfo.buckets.find(bucket => bucket.id === bucketId);
    if (!bucketInfo || !bucketInfo.permissions) return {};
    
    return {
      read: bucketInfo.permissions.read || false,
      write: bucketInfo.permissions.write || false,
      owner: bucketInfo.permissions.owner || false,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h2 className="text-xl font-semibold text-gray-900">
            为密钥 {selectedKey?.name} 管理存储桶绑定
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSavingPermissions}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoadingBuckets ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">加载存储桶列表...</span>
            </div>
          ) : allBuckets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无存储桶</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-900 mb-2">权限说明：</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• <strong>读取 (Read)</strong>：可以列出和下载存储桶中的对象</li>
                  <li>• <strong>写入 (Write)</strong>：可以上传、修改和删除存储桶中的对象</li>
                  <li>• <strong>所有者 (Owner)</strong>：拥有存储桶的完全控制权，包括管理权限</li>
                </ul>
              </div>

              {allBuckets.map((bucket) => {
                const isExpanded = expandedBuckets.has(bucket.id);
                const isLinked = isKeyLinkedToBucket(bucket.id);
                const bucketPermissions = getKeyPermissionsForBucket(bucket.id);

                return (
                  <Card key={bucket.id} className="border-2 hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleBucketToggle(bucket.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${isLinked ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <div>
                            <h3 className="font-medium text-gray-900">{bucket.id}</h3>
                            <p className="text-sm text-gray-500">
                              {isLinked ? '已绑定' : '未绑定'} • 
                              别名: {bucket.aliases?.join(', ') || '无'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isLinked && (
                            <div className="flex items-center space-x-1">
                              {bucketPermissions.read && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">读取权限</span>
                              )}
                              {bucketPermissions.write && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">写入权限</span>
                              )}
                              {bucketPermissions.owner && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">所有者权限</span>
                              )}
                            </div>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['read', 'write', 'owner'] as const).map((permission) => {
                              const isEnabled = bucketPermissions[permission] || false;
                              const permissionLabels = {
                                read: '读取权限',
                                write: '写入权限',
                                owner: '所有者权限'
                              };
                              const permissionColors = {
                                read: 'blue',
                                write: 'green',
                                owner: 'purple'
                              };
                              const color = permissionColors[permission];

                              return (
                                <div key={permission} className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                                  isEnabled 
                                    ? `border-${color}-200 bg-${color}-50` 
                                    : 'border-gray-200 bg-gray-50'
                                }`}>
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                        isEnabled 
                                          ? `border-${color}-500 bg-${color}-500` 
                                          : 'border-gray-300'
                                      }`}>
                                        {isEnabled && <Check className="h-3 w-3 text-white" />}
                                      </div>
                                      <span className={`font-medium ${
                                        isEnabled ? `text-${color}-900` : 'text-gray-700'
                                      }`}>
                                        {permissionLabels[permission]}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant={isEnabled ? "destructive" : "primary"}
                                    size="sm"
                                    onClick={() => handlePermissionChange(bucket.id, permission, !isEnabled)}
                                    disabled={isSavingPermissions}
                                    className="w-full"
                                  >
                                    {isSavingPermissions ? (
                                      <LoadingSpinner className="h-4 w-4" />
                                    ) : (
                                      <>
                                        {isEnabled ? '移除' : '授予'}
                                      </>
                                    )}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>

                          {bucket.aliases && bucket.aliases.length > 0 && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">存储桶别名:</h4>
                              <div className="flex flex-wrap gap-2">
                                {bucket.aliases.map((alias, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-600"
                                  >
                                    {alias}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
          <Button
            onClick={onClose}
            disabled={isSavingPermissions}
            className="px-6"
          >
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
