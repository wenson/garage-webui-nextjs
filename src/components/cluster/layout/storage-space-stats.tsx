'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Server } from 'lucide-react';

interface SpaceStats {
  totalPhysicalSpace: number;
  totalAllocatedCapacity: number;
  totalUsableCapacity: number;
  unallocatedSpace: number;
  availablePhysicalSpace: number;
}

interface StorageSpaceStatsProps {
  spaceStats: SpaceStats;
  formatBytes: (bytes: number) => string;
}

export function StorageSpaceStats({ spaceStats, formatBytes }: StorageSpaceStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Server className="h-5 w-5 mr-2" />
          存储空间统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600">{formatBytes(spaceStats.totalPhysicalSpace)}</div>
            <p className="text-sm text-gray-500">总物理空间</p>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600">{formatBytes(spaceStats.availablePhysicalSpace)}</div>
            <p className="text-sm text-gray-500">可用物理空间</p>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600">{formatBytes(spaceStats.totalAllocatedCapacity)}</div>
            <p className="text-sm text-gray-500">已分配容量</p>
          </div>
          <div className="text-center p-4 border rounded-lg dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600">{formatBytes(spaceStats.unallocatedSpace)}</div>
            <p className="text-sm text-gray-500">未分配空间</p>
          </div>
        </div>
        {spaceStats.totalPhysicalSpace > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>空间分配情况</span>
              <span>{((spaceStats.totalAllocatedCapacity / spaceStats.totalPhysicalSpace) * 100).toFixed(1)}% 已分配</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (spaceStats.totalAllocatedCapacity / spaceStats.totalPhysicalSpace) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
