'use client';

import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Key, Plus } from 'lucide-react';
import { KeyCard } from './key-card';

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

interface KeysListProps {
  keys: unknown[];
  searchTerm: string;
  visibleSecrets: Set<string>;
  setVisibleSecrets: React.Dispatch<React.SetStateAction<Set<string>>>;
  requestedSecrets: Set<string>;
  setRequestedSecrets: React.Dispatch<React.SetStateAction<Set<string>>>;
  onDeleteKey: (keyId: string, keyName?: string) => void;
  onEditPermissions: (key: ActualKeyData) => void;
  onManageBucketBindings: (key: ActualKeyData) => void;
  onShowCreateForm: () => void;
  copyToClipboard: (text: string, description: string) => void;
}

export function KeysList({
  keys,
  searchTerm,
  visibleSecrets,
  setVisibleSecrets,
  requestedSecrets,
  setRequestedSecrets,
  onDeleteKey,
  onEditPermissions,
  onManageBucketBindings,
  onShowCreateForm,
  copyToClipboard
}: KeysListProps) {
  return (
    <div className="space-y-4">
      {keys.length > 0 ? (
        keys.map((key, index) => {
          const actualKey = key as unknown as ActualKeyData;
          const keyId = actualKey.id || actualKey.accessKeyId || `key-${index}`;
          
          return (
            <KeyCard
              key={keyId}
              actualKey={actualKey}
              visibleSecrets={visibleSecrets}
              setVisibleSecrets={setVisibleSecrets}
              requestedSecrets={requestedSecrets}
              setRequestedSecrets={setRequestedSecrets}
              onDeleteKey={onDeleteKey}
              onEditPermissions={onEditPermissions}
              onManageBucketBindings={onManageBucketBindings}
              copyToClipboard={copyToClipboard}
            />
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
              <Button onClick={onShowCreateForm}>
                <Plus className="h-4 w-4 mr-2" />
                创建访问密钥
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
