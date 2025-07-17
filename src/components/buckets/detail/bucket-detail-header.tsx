'use client';

import Button from '@/components/ui/button';
import { ArrowLeft, FileText, Settings } from 'lucide-react';

interface BucketDetailHeaderProps {
  bucketName: string;
  isEditing: boolean;
  onBack: () => void;
  onBrowseObjects: () => void;
  onEditToggle: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export function BucketDetailHeader({
  bucketName,
  isEditing,
  onBack,
  onBrowseObjects,
  onEditToggle,
  onCancel,
  onSave
}: BucketDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {bucketName}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            存储桶配置和管理
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          onClick={onBrowseObjects}
        >
          <FileText className="h-4 w-4 mr-2" />
          浏览对象
        </Button>
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              取消
            </Button>
            <Button onClick={onSave}>
              保存更改
            </Button>
          </>
        ) : (
          <Button
            onClick={onEditToggle}
            className="flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            编辑配置
          </Button>
        )}
      </div>
    </div>
  );
}
