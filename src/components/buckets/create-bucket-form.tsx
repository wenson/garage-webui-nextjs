'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface CreateBucketFormProps {
  show: boolean;
  bucketName: string;
  isCreating: boolean;
  onBucketNameChange: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CreateBucketForm({
  show,
  bucketName,
  isCreating,
  onBucketNameChange,
  onSubmit,
  onCancel
}: CreateBucketFormProps) {
  if (!show) {
    return null;
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          创建新存储桶
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              存储桶名称
            </label>
            <Input
              placeholder="输入存储桶名称..."
              value={bucketName}
              onChange={(e) => onBucketNameChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-xs text-gray-500 mt-1">
              名称必须符合 S3 存储桶命名规范，详见{" "}
              <a 
                href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                AWS 官方文档
              </a>
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={onSubmit}
              disabled={isCreating}
            >
              {isCreating ? "创建中..." : "创建"}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              取消
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
