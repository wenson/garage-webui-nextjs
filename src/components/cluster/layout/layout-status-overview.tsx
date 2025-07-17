'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Server, AlertTriangle } from 'lucide-react';
import { GarageClusterLayout } from '@/types';

interface SpaceStats {
  totalPhysicalSpace: number;
  totalAllocatedCapacity: number;
  totalUsableCapacity: number;
  unallocatedSpace: number;
  availablePhysicalSpace: number;
}

interface LayoutStatusOverviewProps {
  layout?: GarageClusterLayout;
  spaceStats: SpaceStats;
  formatBytes: (bytes: number) => string;
}

export function LayoutStatusOverview({ layout, spaceStats, formatBytes }: LayoutStatusOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">布局版本</CardTitle>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{layout?.version ?? 'N/A'}</div>
          <p className="text-xs text-muted-foreground">
            {layout?.version === 0 ? '未配置' : '已配置'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">存储角色</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{layout?.roles ? Object.keys(layout.roles).length : 0}</div>
          <p className="text-xs text-muted-foreground">
            已分配角色的节点
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">待处理更改</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{layout?.stagedRoleChanges ? Object.keys(layout.stagedRoleChanges).length : 0}</div>
          <p className="text-xs text-muted-foreground">
            等待应用的更改
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">未分配空间</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatBytes(spaceStats.unallocatedSpace)}</div>
          <p className="text-xs text-muted-foreground">
            物理空间 - 已分配容量
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
