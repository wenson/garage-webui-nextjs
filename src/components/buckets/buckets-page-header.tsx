'use client';

import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface BucketsPageHeaderProps {
  onCreateBucket: () => void;
}

export function BucketsPageHeader({ onCreateBucket }: BucketsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          存储桶管理
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          管理您的对象存储桶
        </p>
      </div>
      
      <Button
        onClick={onCreateBucket}
        className="flex items-center"
      >
        <Plus className="h-4 w-4 mr-2" />
        创建存储桶
      </Button>
    </div>
  );
}
