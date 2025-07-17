'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Copy } from 'lucide-react';

interface Bucket {
  id: string;
  globalAliases?: string[];
}

interface BucketInfoCardProps {
  bucket: Bucket;
  onCopyToClipboard: (text: string) => void;
}

export function BucketInfoCard({ bucket, onCopyToClipboard }: BucketInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="h-5 w-5 mr-2" />
          存储桶信息
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">存储桶ID</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={bucket.id}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyToClipboard(bucket.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">全局别名</label>
              <div className="flex flex-wrap gap-2">
                {bucket.globalAliases?.map((alias: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {alias}
                  </Badge>
                ))}
                {bucket.globalAliases?.length === 0 && (
                  <span className="text-sm text-gray-500">无</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
