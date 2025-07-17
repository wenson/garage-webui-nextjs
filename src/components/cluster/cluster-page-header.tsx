'use client';

import Button from '@/components/ui/button';
import { RefreshCw, Settings } from 'lucide-react';

interface ClusterPageHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  onGoToLayout: () => void;
}

export function ClusterPageHeader({ 
  refreshing, 
  onRefresh, 
  onGoToLayout 
}: ClusterPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          集群管理
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          监控和管理 Garage 集群节点状态
        </p>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          刷新
        </Button>
        <Button
          onClick={onGoToLayout}
          variant="secondary"
          className="flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          布局配置
        </Button>
      </div>
    </div>
  );
}
