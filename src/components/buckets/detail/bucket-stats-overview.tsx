'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, HardDrive, Shield, Database } from 'lucide-react';
import { GetBucketInfoResponse } from '@/types/garage-api-v2';

interface BucketStatsOverviewProps {
  bucket: GetBucketInfoResponse;
  formatBytes: (bytes: number) => string;
}

export function BucketStatsOverview({ bucket, formatBytes }: BucketStatsOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">对象数量</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bucket.objects || 0}</div>
          <p className="text-xs text-muted-foreground">
            个文件对象
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">存储大小</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(bucket.bytes || 0)}</div>
          <p className="text-xs text-muted-foreground">
            已使用空间
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">访问密钥</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bucket.keys?.length || 0}</div>
          <p className="text-xs text-muted-foreground">
            个授权密钥
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">未完成上传</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bucket.unfinishedUploads || 0}</div>
          <p className="text-xs text-muted-foreground">
            个待完成
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
