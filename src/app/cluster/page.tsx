"use client";

import { useState } from "react";
import { useClusterStatus, useHealth } from "@/hooks/api";
import { Loading } from "@/components/ui/loading";
import { ClusterPageHeader } from "@/components/cluster/cluster-page-header";
import { ClusterOverview } from "@/components/cluster/cluster-overview";
import { NodeList } from "@/components/cluster/node-list";
import { ClusterStats } from "@/components/cluster/cluster-stats";

export default function ClusterPage() {
  const [refreshing, setRefreshing] = useState(false);
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useHealth();
  const { data: cluster, isLoading: clusterLoading, refetch: refetchCluster } = useClusterStatus();

  const isLoading = healthLoading || clusterLoading;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchHealth(), refetchCluster()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleGoToLayout = () => {
    window.location.href = '/cluster/layout';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载集群信息..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <ClusterPageHeader 
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onGoToLayout={handleGoToLayout}
      />

      {/* 集群总览 */}
      <ClusterOverview health={health} cluster={cluster} />

      {/* 节点列表 */}
      <NodeList nodes={cluster?.nodes} />

      {/* 集群统计信息 */}
      <ClusterStats cluster={cluster} />
    </div>
  );
}
