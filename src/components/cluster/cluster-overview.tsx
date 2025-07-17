'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Server, Network, CheckCircle, XCircle } from 'lucide-react';
import { GarageHealthResponse, GarageClusterStatus } from '@/types';

interface ClusterOverviewProps {
  health?: GarageHealthResponse;
  cluster?: GarageClusterStatus;
}

export function ClusterOverview({ health, cluster }: ClusterOverviewProps) {
  const onlineNodes = cluster?.nodes?.filter(n => n.isUp === true).length || 0;
  const totalNodes = cluster?.nodes?.length || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">集群健康状态</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            {health?.status === 'healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="text-2xl font-bold">
              {health?.status === 'healthy' ? '健康' : '异常'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalNodes}</div>
          <p className="text-xs text-muted-foreground">
            在线: {onlineNodes}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">布局版本</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {cluster?.layoutVersion || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">
            当前集群布局版本
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
