"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { 
  Trash2, 
  Copy,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Database
} from "lucide-react";
import { useKeyWithSecret } from "@/hooks/api/keys";

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

interface KeyCardProps {
  actualKey: ActualKeyData;
  visibleSecrets: Set<string>;
  setVisibleSecrets: React.Dispatch<React.SetStateAction<Set<string>>>;
  requestedSecrets: Set<string>;
  setRequestedSecrets: React.Dispatch<React.SetStateAction<Set<string>>>;
  onDeleteKey: (keyId: string, keyName?: string) => void;
  onEditPermissions: (key: ActualKeyData) => void;
  onManageBucketBindings: (key: ActualKeyData) => void;
  copyToClipboard: (text: string, description: string) => void;
}

export function KeyCard({
  actualKey,
  visibleSecrets,
  setVisibleSecrets,
  requestedSecrets,
  setRequestedSecrets,
  onDeleteKey,
  onEditPermissions,
  onManageBucketBindings,
  copyToClipboard
}: KeyCardProps) {
  const keyId = actualKey.id || actualKey.accessKeyId || '';
  const isSecretRequested = requestedSecrets.has(keyId);
  const isSecretVisible = visibleSecrets.has(keyId);

  const { data: keyWithSecret, isLoading: isLoadingSecret } = useKeyWithSecret(keyId, isSecretRequested);

  const toggleSecretVisibility = (keyId: string) => {
    if (!isSecretRequested) {
      // 第一次点击：请求密钥
      setRequestedSecrets(prev => new Set(prev).add(keyId));
    }
    
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const secretKey = keyWithSecret?.secretAccessKey || '';
  const hasSecretKey = secretKey && secretKey.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {actualKey.name || "未命名密钥"}
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(actualKey.created).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant={actualKey.expired ? "destructive" : "default"}
              className="text-xs"
            >
              {actualKey.expired ? "已过期" : "有效"}
            </Badge>
            {actualKey.permissions?.createBucket && (
              <Badge variant="secondary" className="text-xs">
                创建桶权限
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Access Key ID */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Access Key ID
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono">
              {keyId}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(keyId, "Access Key ID")}
              className="p-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Secret Access Key */}
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Secret Access Key
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-mono">
              {isLoadingSecret && isSecretRequested ? (
                <span className="text-gray-500">加载中...</span>
              ) : isSecretVisible && hasSecretKey ? (
                secretKey
              ) : (
                "••••••••••••••••••••••••••••••••••••••••••••"
              )}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSecretVisibility(keyId)}
              className="p-2"
              disabled={isLoadingSecret}
            >
              {isSecretVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            {isSecretVisible && hasSecretKey && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(secretKey, "Secret Key")}
                className="p-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEditPermissions(actualKey)}
              className="flex items-center space-x-1"
            >
              <Settings className="h-4 w-4" />
              <span>编辑权限</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onManageBucketBindings(actualKey)}
              className="flex items-center space-x-1"
            >
              <Database className="h-4 w-4" />
              <span>管理存储桶绑定</span>
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteKey(keyId, actualKey.name)}
            className="flex items-center space-x-1"
          >
            <Trash2 className="h-4 w-4" />
            <span>删除</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
