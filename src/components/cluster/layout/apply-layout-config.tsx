'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { ErrorMessage } from '@/components/ui/error-message';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { GarageClusterLayout } from '@/types';

interface ApplyLayoutConfigProps {
  layout?: GarageClusterLayout;
  isApplying: boolean;
  error?: Error | null;
  onApplyLayout: () => void;
}

export function ApplyLayoutConfig({
  layout,
  isApplying,
  error,
  onApplyLayout
}: ApplyLayoutConfigProps) {
  // 只在有待处理更改或未初始化时显示
  const shouldShow = layout && (Object.keys(layout.stagedRoleChanges || {}).length > 0 || layout.version === 0);
  
  if (!shouldShow) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          应用配置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {layout.version === 0 
              ? "检测到未初始化的集群布局。配置节点后，点击下方按钮应用配置。"
              : `有 ${Object.keys(layout.stagedRoleChanges || {}).length} 个待处理的更改需要应用。`
            }
          </p>
          
          <Button
            onClick={onApplyLayout}
            disabled={isApplying}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                应用中...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                应用集群布局
              </>
            )}
          </Button>

          {error && (
            <ErrorMessage 
              error={error}
              message={error.message || '应用布局失败'}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
