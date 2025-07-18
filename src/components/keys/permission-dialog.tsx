"use client";

import Button from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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

interface PermissionDialogProps {
  isOpen: boolean;
  selectedKey: ActualKeyData | null;
  keyDetailedInfo: KeyDetailedInfo | null;
  tempPermissions: Record<string, boolean>;
  isSavingPermissions: boolean;
  onClose: () => void;
  onShowBucketBindingDialog: () => void;
  onGlobalPermissionChange: (permission: string, enabled: boolean) => void;
}

export function PermissionDialog({
  isOpen,
  selectedKey,
  keyDetailedInfo,
  tempPermissions,
  isSavingPermissions,
  onClose,
  onShowBucketBindingDialog,
  onGlobalPermissionChange
}: PermissionDialogProps) {
  if (!isOpen || !selectedKey) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* 对话框头部 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-750 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                密钥权限管理
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                管理密钥 &quot;<span className="font-medium text-purple-600 dark:text-purple-400">{selectedKey.name || "未命名密钥"}</span>&quot; 的全局和存储桶权限
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* 对话框内容 */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="space-y-6">
            {/* 密钥基本信息 */}
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">密钥基本信息</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">查看密钥的详细信息和状态</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">ID:</span>
                    <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-gray-100">
                      {keyDetailedInfo?.accessKeyId || selectedKey.id || selectedKey.accessKeyId}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-16">名称:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {keyDetailedInfo?.name || selectedKey.name || "未命名"}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">创建时间:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {new Date(selectedKey.created).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">状态:</span>
                    <Badge 
                      variant={
                        (keyDetailedInfo?.expired !== undefined ? keyDetailedInfo.expired : selectedKey.expired) 
                          ? "destructive" 
                          : "default"
                      }
                      className="text-xs"
                    >
                      {keyDetailedInfo?.expired !== undefined 
                        ? (keyDetailedInfo.expired ? "已过期" : "有效") 
                        : (selectedKey.expired ? "已过期" : "有效")
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* 全局权限设置 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-850 border border-green-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">全局权限设置</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">配置密钥的系统级权限</p>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-green-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">创建存储桶权限</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">允许此密钥创建新的存储桶</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={
                        tempPermissions.hasOwnProperty('createBucket') 
                          ? tempPermissions.createBucket 
                          : (keyDetailedInfo?.permissions?.createBucket ?? selectedKey.permissions?.createBucket ?? false)
                      }
                      onChange={(e) => onGlobalPermissionChange('createBucket', e.target.checked)}
                    />
                    <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 group-hover:peer-checked:bg-blue-700"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 存储桶权限列表 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-850 border border-blue-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">存储桶权限管理</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">查看和管理密钥对各个存储桶的访问权限</p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onShowBucketBindingDialog}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  管理绑定
                </Button>
              </div>
              
              {/* 权限说明 */}
              <div className="text-sm text-gray-600 dark:text-gray-400 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="font-medium text-blue-900 dark:text-blue-200 mb-2">权限说明：</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-300">
                  <li>• <strong>读取 (Read)</strong>：可以列出和下载存储桶中的对象</li>
                  <li>• <strong>写入 (Write)</strong>：可以上传、修改和删除存储桶中的对象</li>
                  <li>• <strong>所有者 (Owner)</strong>：拥有存储桶的完全控制权，包括管理权限</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                {keyDetailedInfo?.buckets && keyDetailedInfo.buckets.length > 0 ? (
                  keyDetailedInfo.buckets.map((bucket, index: number) => (
                    <div key={bucket.id || index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {bucket.globalAliases?.[0] || "未命名存储桶"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              {bucket.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge 
                            variant={bucket.permissions?.read ? "default" : "secondary"} 
                            className={bucket.permissions?.read 
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800" 
                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {bucket.permissions?.read ? "读取权限" : "无读取权限"}
                          </Badge>
                          <Badge 
                            variant={bucket.permissions?.write ? "default" : "secondary"} 
                            className={bucket.permissions?.write 
                              ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800" 
                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            {bucket.permissions?.write ? "写入权限" : "无写入权限"}
                          </Badge>
                          <Badge 
                            variant={bucket.permissions?.owner ? "default" : "secondary"} 
                            className={bucket.permissions?.owner 
                              ? "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-800" 
                              : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            }
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            {bucket.permissions?.owner ? "所有者权限" : "无所有者权限"}
                          </Badge>
                        </div>
                      </div>
                      {bucket.localAliases && bucket.localAliases.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2">
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium">本地别名:</span> {bucket.localAliases.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-gray-700 rounded-lg p-8">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {keyDetailedInfo ? "此密钥暂未绑定特定存储桶" : "正在加载存储桶权限信息..."}
                        </h4>
                        {keyDetailedInfo && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            该密钥目前只有全局权限，如需访问特定存储桶，请点击&ldquo;管理绑定&rdquo;按钮为其分配存储桶级别的权限。
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 对话框底部操作栏 */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isSavingPermissions && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  正在保存权限变更...
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                关闭
              </Button>
              <Button 
                disabled={isSavingPermissions}
                onClick={() => {
                  onClose();
                  toast.success('权限设置已保存');
                }}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {isSavingPermissions ? '保存中...' : '保存更改'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
