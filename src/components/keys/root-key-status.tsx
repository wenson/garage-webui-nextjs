"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Key, 
  Eye, 
  EyeOff,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { useRootKeyConfig, markRootKeyAsConfigured } from '@/hooks/api/root-key';
import CreateRootKeyForm from './create-root-key-form';

interface RootKeyStatusProps {
  onKeyConfigured?: () => void;
}

export function RootKeyStatus({ onKeyConfigured }: RootKeyStatusProps) {
  const { data: envConfig, isLoading, refetch } = useRootKeyConfig();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleKeyCreated = () => {
    setShowCreateForm(false);
    markRootKeyAsConfigured();
    refetch();
    toast.success('Root Key 已创建并可以使用');
    if (onKeyConfigured) {
      onKeyConfigured();
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-6">
          <div className="text-center">
            <p>检查配置状态...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showCreateForm) {
    return (
      <CreateRootKeyForm
        onKeyCreated={handleKeyCreated}
        onClose={() => setShowCreateForm(false)}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <CardTitle>Root Key 状态</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 配置状态 */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center space-x-3">
            {envConfig?.isConfigured ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
            <div>
              <p className="font-medium">
                {envConfig?.isConfigured ? 'Root Key 已配置' : 'Root Key 未配置'}
              </p>
              <p className="text-sm text-gray-500">
                {envConfig?.isConfigured 
                  ? '本地存储中找到 Root Key 配置记录' 
                  : '需要创建 Root Key 以管理文件和存储桶'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        {showDetails && (
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-sm">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">配置说明</p>
              <p className="text-gray-600 dark:text-gray-400">
                Root Key 配置状态基于本地存储记录。如果您已经通过其他方式配置了环境变量，
                请忽略此状态或手动标记为已配置。
              </p>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center space-x-2">
          {!envConfig?.isConfigured && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex-1"
            >
              <Key className="h-4 w-4 mr-2" />
              创建 Root Key
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={() => refetch()}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            刷新状态
          </Button>
          
          {envConfig?.isConfigured && (
            <Button
              variant="ghost"
              onClick={() => setShowCreateForm(true)}
              size="sm"
            >
              <Key className="h-4 w-4 mr-2" />
              创建新 Key
            </Button>
          )}
        </div>

        {/* 说明信息 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Root Key 用途：</strong>
            Root Key 是具有全局权限的访问密钥，用于文件上传、下载、对象浏览等操作。
            创建后请将密钥信息添加到环境变量中。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RootKeyStatus;
