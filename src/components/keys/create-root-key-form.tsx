"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  Lock,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRootKey, CreateRootKeyResponse, markRootKeyAsConfigured } from '@/hooks/api/root-key';

interface CreateRootKeyFormProps {
  onKeyCreated?: (keyData: CreateRootKeyResponse) => void;
  onClose?: () => void;
}

export function CreateRootKeyForm({ onKeyCreated, onClose }: CreateRootKeyFormProps) {
  const [keyName, setKeyName] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<CreateRootKeyResponse | null>(null);
  
  const createRootKeyMutation = useCreateRootKey();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyName.trim()) {
      toast.error('请输入密钥名称');
      return;
    }

    try {
      const result = await createRootKeyMutation.mutateAsync({
        name: keyName.trim(),
        globalPermissions: true,
      });

      setCreatedKey(result);
      
      // 标记为已配置
      markRootKeyAsConfigured();
      
      if (result.warning) {
        toast.warning(result.warning);
      } else {
        toast.success(result.message || 'Root Key 创建成功');
      }
      
      if (onKeyCreated) {
        onKeyCreated(result);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '创建失败');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} 已复制到剪贴板`);
    } catch {
      toast.error('复制失败');
    }
  };

  const copyKeyConfiguration = () => {
    if (!createdKey) return;
    
    const config = `# Root Key Configuration
GARAGE_S3_ACCESS_KEY_ID=${createdKey.accessKeyId}
GARAGE_S3_SECRET_ACCESS_KEY=${createdKey.secretAccessKey}

# 将以上配置添加到您的 .env.local 文件中`;
    
    copyToClipboard(config, '密钥配置');
  };

  if (createdKey) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle>Root Key 创建成功</CardTitle>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {createdKey.warning && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">警告</p>
                <p>{createdKey.warning}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">密钥名称</Label>
              <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                {createdKey.name}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">访问密钥 ID</Label>
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border font-mono text-sm">
                  {createdKey.accessKeyId}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.accessKeyId, '访问密钥 ID')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">密钥</Label>
              <div className="mt-1 flex items-center space-x-2">
                <div className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border font-mono text-sm">
                  {showSecretKey ? createdKey.secretAccessKey : '•'.repeat(40)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                >
                  {showSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(createdKey.secretAccessKey, '密钥')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  配置说明
                </p>
                <p className="text-blue-700 dark:text-blue-300 mb-3">
                  请将以下配置添加到您的 <code className="bg-white dark:bg-gray-800 px-1 rounded">.env.local</code> 文件中：
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyKeyConfiguration}
                  className="w-full"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制完整配置
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-2">
              <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">安全提醒</p>
                <p>
                  请妥善保管您的密钥信息。这是唯一一次显示完整密钥的机会。
                  建议立即保存到安全的位置，并且不要在不安全的环境中分享。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="h-6 w-6" />
          <CardTitle>创建 Root Key</CardTitle>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="keyName">密钥名称</Label>
            <Input
              id="keyName"
              type="text"
              placeholder="例如: root-key-2024"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              disabled={createRootKeyMutation.isPending}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              用于标识这个密钥的名称
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Root Key 权限</p>
                <ul className="space-y-1">
                  <li>• 创建和删除存储桶</li>
                  <li>• 读取和写入所有现有存储桶</li>
                  <li>• 创建和删除对象</li>
                  <li>• 自动获得新创建桶的权限</li>
                  <li>• 全局文件操作权限</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createRootKeyMutation.isPending || !keyName.trim()}
          >
            {createRootKeyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              <>
                <Key className="h-4 w-4 mr-2" />
                创建 Root Key
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default CreateRootKeyForm;
