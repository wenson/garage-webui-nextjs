"use client";

import { useState, useEffect } from "react";
import { useClusterStatus, useClusterLayout, useUpdateClusterLayout, useApplyClusterLayout } from "@/hooks/api/cluster";
import { Loading } from "@/components/ui/loading";
import { toast } from "sonner";

// 布局组件
import { LayoutPageHeader } from "@/components/cluster/layout/layout-page-header";
import { LayoutStatusOverview } from "@/components/cluster/layout/layout-status-overview";
import { StorageSpaceStats } from "@/components/cluster/layout/storage-space-stats";
import { ClusterNodesList } from "@/components/cluster/layout/cluster-nodes-list";
import { NodeConfigForm } from "@/components/cluster/layout/node-config-form";
import { ApplyLayoutConfig } from "@/components/cluster/layout/apply-layout-config";

export default function ClusterLayoutPage() {
  const [nodeConfig, setNodeConfig] = useState({
    id: '',
    zone: 'dc1',
    capacity: 1000000000, // 1GB default
    tags: {} as Record<string, string>
  });

  const [capacityConfig, setCapacityConfig] = useState({
    value: 1,
    unit: 'GB' as 'MB' | 'GB'
  });

  // 容量转换函数
  const convertToBytes = (value: number, unit: 'MB' | 'GB'): number => {
    const multipliers = {
      'MB': 1024 * 1024,
      'GB': 1024 * 1024 * 1024
    };
    return Math.floor(value * multipliers[unit]);
  };

  const convertFromBytes = (bytes: number): { value: number; unit: 'MB' | 'GB' } => {
    const gb = bytes / (1024 * 1024 * 1024);
    const mb = bytes / (1024 * 1024);
    
    if (gb >= 1) {
      return { value: Math.round(gb * 100) / 100, unit: 'GB' };
    } else {
      return { value: Math.round(mb * 100) / 100, unit: 'MB' };
    }
  };

  // 更新容量配置时同步更新字节数
  const handleCapacityChange = (value: number, unit: 'MB' | 'GB') => {
    setCapacityConfig({ value, unit });
    setNodeConfig(prev => ({ 
      ...prev, 
      capacity: convertToBytes(value, unit) 
    }));
  };

  const { data: cluster, isLoading: clusterLoading, refetch: refetchCluster } = useClusterStatus();
  const { data: layout, isLoading: layoutLoading, refetch: refetchLayout } = useClusterLayout();
  const updateLayoutMutation = useUpdateClusterLayout();
  const applyLayoutMutation = useApplyClusterLayout();

  const isLoading = clusterLoading || layoutLoading;

  // 计算空间统计 - 移到数据获取之后
  const calculateSpaceStats = () => {
    if (!cluster?.nodes || !layout?.roles) {
      return {
        totalPhysicalSpace: 0,
        totalAllocatedCapacity: 0,
        totalUsableCapacity: 0,
        unallocatedSpace: 0,
        availablePhysicalSpace: 0
      };
    }

    // 计算物理空间
    const totalPhysicalSpace = cluster.nodes.reduce((total, node) => {
      return total + (node.dataPartition?.total || 0);
    }, 0);

    const availablePhysicalSpace = cluster.nodes.reduce((total, node) => {
      return total + (node.dataPartition?.available || 0);
    }, 0);

    // 计算已分配的逻辑容量 - 检查 roles 是数组还是对象
    let totalAllocatedCapacity = 0;
    let totalUsableCapacity = 0;

    if (Array.isArray(layout.roles)) {
      totalAllocatedCapacity = layout.roles.reduce((total: number, role: Record<string, unknown>) => {
        return total + (typeof role.capacity === 'number' ? role.capacity : 0);
      }, 0);

      totalUsableCapacity = layout.roles.reduce((total: number, role: Record<string, unknown>) => {
        return total + (typeof role.usableCapacity === 'number' ? role.usableCapacity : 0);
      }, 0);
    } else if (typeof layout.roles === 'object') {
      // 如果 roles 是对象，遍历其值
      Object.values(layout.roles).forEach((role: unknown) => {
        if (role && typeof role === 'object') {
          const roleObj = role as Record<string, unknown>;
          totalAllocatedCapacity += typeof roleObj.capacity === 'number' ? roleObj.capacity : 0;
          totalUsableCapacity += typeof roleObj.usableCapacity === 'number' ? roleObj.usableCapacity : 0;
        }
      });
    }

    // 计算未分配空间（物理空间 - 已分配容量）
    const unallocatedSpace = Math.max(0, totalPhysicalSpace - totalAllocatedCapacity);

    return {
      totalPhysicalSpace,
      totalAllocatedCapacity,
      totalUsableCapacity,
      unallocatedSpace,
      availablePhysicalSpace
    };
  };

  const spaceStats = calculateSpaceStats();

  // 格式化字节数为可读格式
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 初始化时同步容量配置
  useEffect(() => {
    const initial = convertFromBytes(1000000000); // 使用默认的1GB
    setCapacityConfig(initial);
  }, []);

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchCluster(), refetchLayout()]);
      toast.success("集群信息已刷新");
    } catch {
      toast.error("刷新失败");
    }
  };

  const handleSelectNode = (nodeId: string) => {
    setNodeConfig(prev => ({ ...prev, id: nodeId }));
  };

  const handleNodeConfigChange = (config: Partial<typeof nodeConfig>) => {
    setNodeConfig(prev => ({ ...prev, ...config }));
  };

  const handleConfigureNode = async () => {
    if (!nodeConfig.id) {
      toast.error("请选择一个节点");
      return;
    }

    try {
      await updateLayoutMutation.mutateAsync({
        id: nodeConfig.id,
        zone: nodeConfig.zone,
        capacity: nodeConfig.capacity,
        tags: nodeConfig.tags
      });
      toast.success("节点配置已更新");
    } catch (error) {
      toast.error(`配置节点失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleApplyLayout = async () => {
    if (!layout?.version && layout?.version !== 0) {
      toast.error("无效的布局版本");
      return;
    }

    try {
      await applyLayoutMutation.mutateAsync({
        version: layout.version + 1
      });
      toast.success("集群布局已应用");
    } catch (error) {
      toast.error(`应用布局失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载集群配置..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <LayoutPageHeader 
        isLoading={isLoading}
        onRefresh={handleRefresh}
      />

      {/* 布局状态概览 */}
      <LayoutStatusOverview 
        layout={layout}
        spaceStats={spaceStats}
        formatBytes={formatBytes}
      />

      {/* 存储空间统计 */}
      <StorageSpaceStats 
        spaceStats={spaceStats}
        formatBytes={formatBytes}
      />

      {/* 节点列表和配置 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClusterNodesList 
          cluster={cluster}
          onSelectNode={handleSelectNode}
        />

        <NodeConfigForm 
          nodeConfig={nodeConfig}
          capacityConfig={capacityConfig}
          isUpdating={updateLayoutMutation.isPending}
          error={updateLayoutMutation.error}
          onNodeConfigChange={handleNodeConfigChange}
          onCapacityChange={handleCapacityChange}
          onConfigureNode={handleConfigureNode}
        />
      </div>

      {/* 应用布局配置 */}
      <ApplyLayoutConfig 
        layout={layout}
        isApplying={applyLayoutMutation.isPending}
        error={applyLayoutMutation.error}
        onApplyLayout={handleApplyLayout}
      />
    </div>
  );
}
