'use client';

import Button from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LayoutPageHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function LayoutPageHeader({ isLoading, onRefresh }: LayoutPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          集群布局配置
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          配置 Garage 集群节点存储角色和容量
        </p>
      </div>
      
      <Button
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        刷新
      </Button>
    </div>
  );
}
