"use client";

import { useClusterStatus, useHealth, useBuckets, useKeys } from "@/hooks/api";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import StatsCard from "@/components/dashboard/stats-card";
import ClusterOverview from "@/components/dashboard/cluster-overview";
import RecentActivity from "@/components/dashboard/recent-activity";
// import EnvironmentStatus from "@/components/environment/environment-status";
import { Server, Database, Key, Activity, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: health, isLoading: healthLoading } = useHealth();
  const { data: cluster, isLoading: clusterLoading } = useClusterStatus();
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const { data: keys, isLoading: keysLoading } = useKeys();

  const isLoading = healthLoading || clusterLoading || bucketsLoading || keysLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载仪表板数据..." />
      </div>
    );
  }

  const healthStatus = health?.status || 'unknown';
  const nodeCount = cluster?.nodes?.length || 0;
  const bucketCount = buckets?.length || 0;
  const keyCount = keys?.length || 0;

  const onlineNodes = cluster?.nodes?.filter(node => 
    node.isUp === true
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          仪表板
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Garage 对象存储服务管理概览
        </p>
      </div>

      {/* 健康状态提醒 */}
      {healthStatus !== 'healthy' && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                服务状态异常
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                请检查集群健康状态和节点连接
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 环境服务状态 */}
      {/* <EnvironmentStatus /> */}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="集群健康状态"
          value={healthStatus === 'healthy' ? '正常' : '异常'}
          icon={Activity}
          trend={healthStatus === 'healthy' ? 'up' : 'down'}
          className={healthStatus === 'healthy' ? 'text-green-600' : 'text-red-600'}
        />
        
        <StatsCard
          title="在线节点"
          value={`${onlineNodes}/${nodeCount}`}
          subtitle={`总共 ${nodeCount} 个节点`}
          icon={Server}
          trend={onlineNodes === nodeCount ? 'up' : onlineNodes > 0 ? 'stable' : 'down'}
        />
        
        <StatsCard
          title="存储桶"
          value={bucketCount}
          subtitle="个存储桶"
          icon={Database}
          trend="stable"
        />
        
        <StatsCard
          title="访问密钥"
          value={keyCount}
          subtitle="个访问密钥"
          icon={Key}
          trend="stable"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 集群概览 */}
        <ClusterOverview cluster={cluster} />
        
        {/* 最近活动 */}
        <RecentActivity />
      </div>
    </div>
  );
}
