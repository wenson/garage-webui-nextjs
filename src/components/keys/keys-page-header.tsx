'use client';

import Button from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface KeysPageHeaderProps {
  onCreateKey: () => void;
}

export function KeysPageHeader({ onCreateKey }: KeysPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          访问密钥管理
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          管理 S3 API 访问密钥和权限
        </p>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="secondary"
          onClick={() => router.push('/keys/root-key')}
          className="flex items-center"
        >
          <Shield className="h-4 w-4 mr-2" />
          Root Key 管理
        </Button>
        
        <Button
          onClick={onCreateKey}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建密钥
        </Button>
      </div>
    </div>
  );
}
