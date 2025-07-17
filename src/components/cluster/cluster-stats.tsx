'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HardDrive } from 'lucide-react';
import { GarageClusterStatus } from '@/types';

interface ClusterStatsProps {
  cluster?: GarageClusterStatus;
}

export function ClusterStats({ cluster }: ClusterStatsProps) {
  if (!cluster) return null;

  const totalNodes = cluster.nodes?.length || 0;
  const onlineNodes = cluster.nodes?.filter(n => n.isUp === true).length || 0;
  const garageVersion = cluster.nodes && cluster.nodes.length > 0 && cluster.nodes[0].garageVersion;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardDrive className="h-5 w-5 mr-2" />
          集群统计
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <span className="font-medium">节点总数:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {totalNodes}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">在线节点:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {onlineNodes}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">布局版本:</span>
            <span className="text-gray-600 dark:text-gray-400">
              {cluster.layoutVersion || '未知'}
            </span>
          </div>
          {garageVersion && (
            <div className="flex justify-between">
              <span className="font-medium">Garage版本:</span>
              <span className="text-gray-600 dark:text-gray-400">
                {garageVersion}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
