'use client';

import { Card, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { BucketCard } from './bucket-card';
import { FolderOpen, Plus } from 'lucide-react';

interface Bucket {
  id: string;
  globalAliases: string[];
  localAliases?: Record<string, string>;
  websiteAccess?: boolean;
  corsRules?: Array<unknown>;
  quotas?: unknown;
}

interface BucketsListProps {
  buckets: Bucket[];
  searchTerm: string;
  onConfigure: (bucketId: string, bucketName: string) => void;
  onDelete: (bucketId: string, bucketName: string) => void;
  onCreateBucket: () => void;
}

export function BucketsList({ 
  buckets, 
  searchTerm, 
  onConfigure, 
  onDelete, 
  onCreateBucket 
}: BucketsListProps) {
  if (buckets.length === 0) {
    return (
      <div className="col-span-full">
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? "未找到匹配的存储桶" : "暂无存储桶"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "尝试使用其他关键词搜索" : "创建您的第一个存储桶开始使用"}
            </p>
            {!searchTerm && (
              <Button onClick={onCreateBucket}>
                <Plus className="h-4 w-4 mr-2" />
                创建存储桶
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {buckets.map((bucket) => (
        <BucketCard
          key={bucket.id}
          bucket={bucket}
          onConfigure={onConfigure}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}
