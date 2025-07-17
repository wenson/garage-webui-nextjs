'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { FolderOpen, Database, Settings, Trash2 } from 'lucide-react';

interface Bucket {
  id: string;
  globalAliases: string[];
  localAliases?: Record<string, string>;
  websiteAccess?: boolean;
  corsRules?: Array<unknown>;
  quotas?: unknown;
}

interface BucketCardProps {
  bucket: Bucket;
  onConfigure: (bucketId: string, bucketName: string) => void;
  onDelete: (bucketId: string, bucketName: string) => void;
}

export function BucketCard({ bucket, onConfigure, onDelete }: BucketCardProps) {
  const bucketName = bucket.globalAliases[0] || bucket.id;
  const localAliasCount = bucket.localAliases ? Object.keys(bucket.localAliases).length : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">{bucketName}</CardTitle>
          </div>
          <Badge variant="secondary">
            {localAliasCount} 个别名
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {/* 基本信息 */}
          <div className="text-sm space-y-1">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Database className="h-4 w-4 mr-2" />
              ID: <span className="font-mono text-xs ml-1">{bucket.id}</span>
            </div>
            
            {bucket.globalAliases && bucket.globalAliases.length > 0 && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Settings className="h-4 w-4 mr-2" />
                全局别名: {bucket.globalAliases.join(", ")}
              </div>
            )}
            
            {bucket.localAliases && Object.keys(bucket.localAliases).length > 0 && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Settings className="h-4 w-4 mr-2" />
                本地别名: {Object.values(bucket.localAliases).join(", ")}
              </div>
            )}
          </div>

          {/* 配置信息 */}
          <div>
            <p className="text-sm font-medium mb-2">配置状态:</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>网站访问:</span>
                <Badge variant={bucket.websiteAccess ? "default" : "secondary"}>
                  {bucket.websiteAccess ? "启用" : "禁用"}
                </Badge>
              </div>
              
              {bucket.corsRules && bucket.corsRules.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span>CORS 规则:</span>
                  <Badge variant="default">
                    {bucket.corsRules.length} 条规则
                  </Badge>
                </div>
              )}
              
              {!!bucket.quotas && (
                <div className="flex items-center justify-between text-xs">
                  <span>配额设置:</span>
                  <Badge variant="secondary">已配置</Badge>
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between pt-3 border-t">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onConfigure(bucket.id, bucketName)}
            >
              <Settings className="h-4 w-4 mr-1" />
              配置
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(bucket.id, bucketName)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
