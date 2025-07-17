"use client";

import { useState, useEffect } from "react";
import { useClusterStatus, useClusterLayout, useUpdateClusterLayout, useApplyClusterLayout } from "@/hooks/api/cluster";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { 
  Server, 
  Settings, 
  Plus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

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

  const handleConfigureNode = async (nodeId: string) => {
    if (!nodeId) {
      toast.error("请选择一个节点");
      return;
    }

    try {
      await updateLayoutMutation.mutateAsync({
        id: nodeId,
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

  const getNodeStatusIcon = (isUp?: boolean) => {
    if (isUp === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isUp === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getNodeStatusBadge = (isUp?: boolean) => {
    if (isUp === true) {
      return <Badge variant="default" className="bg-green-100 text-green-800">在线</Badge>;
    } else if (isUp === false) {
      return <Badge variant="destructive">离线</Badge>;
    } else {
      return <Badge variant="secondary">未知</Badge>;
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
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {/* 布局状态 */}
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

      {/* 空间统计详情 */}
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

      {/* 节点列表和配置 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 可用节点 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="h-5 w-5 mr-2" />
              集群节点
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cluster?.nodes && cluster.nodes.length > 0 ? (
              <div className="space-y-4">
                {cluster.nodes.map((node, index) => (
                  <div
                    key={node.id || index}
                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-4">
                      {getNodeStatusIcon(node.isUp)}
                      <div className="flex-1">
                        <h3 className="font-medium text-sm font-mono">
                          {node.id || `节点 ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {node.addr || '地址未知'}
                        </p>
                        {node.hostname && (
                          <p className="text-xs text-gray-400">
                            主机: {node.hostname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {getNodeStatusBadge(node.isUp)}
                      {node.id && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setNodeConfig(prev => ({ ...prev, id: node.id }));
                          }}
                          disabled={!node.isUp}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          配置
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无节点信息</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 节点配置表单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              节点存储配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nodeId">节点ID</Label>
              <Input
                id="nodeId"
                value={nodeConfig.id}
                onChange={(e) => setNodeConfig(prev => ({ ...prev, id: e.target.value }))}
                placeholder="选择或输入节点ID"
                className="font-mono text-sm"
              />
            </div>

            <div>
              <Label htmlFor="zone">存储区域</Label>
              <Input
                id="zone"
                value={nodeConfig.zone}
                onChange={(e) => setNodeConfig(prev => ({ ...prev, zone: e.target.value }))}
                placeholder="例如: dc1, zone-a"
              />
            </div>

            <div>
              <Label htmlFor="capacity">存储容量</Label>
              <div className="flex space-x-2">
                <Input
                  id="capacity"
                  type="number"
                  value={capacityConfig.value}
                  onChange={(e) => handleCapacityChange(parseFloat(e.target.value) || 0, capacityConfig.unit)}
                  placeholder="例如: 100"
                  className="flex-1"
                  min="0"
                  step="0.1"
                />
                <select
                  value={capacityConfig.unit}
                  onChange={(e) => handleCapacityChange(capacityConfig.value, e.target.value as 'MB' | 'GB')}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                总计: {(nodeConfig.capacity / 1024 / 1024 / 1024).toFixed(3)} GB ({nodeConfig.capacity.toLocaleString()} 字节)
              </p>
            </div>

            <Button
              onClick={() => handleConfigureNode(nodeConfig.id)}
              disabled={!nodeConfig.id || updateLayoutMutation.isPending}
              className="w-full"
            >
              {updateLayoutMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  配置中...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  分配存储角色
                </>
              )}
            </Button>

            {updateLayoutMutation.error && (
              <ErrorMessage 
                error={updateLayoutMutation.error} 
                message={updateLayoutMutation.error.message || '配置节点失败'} 
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* 应用布局 */}
      {layout && (Object.keys(layout.stagedRoleChanges || {}).length > 0 || layout.version === 0) && (
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
                onClick={handleApplyLayout}
                disabled={applyLayoutMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {applyLayoutMutation.isPending ? (
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

              {applyLayoutMutation.error && (
                <ErrorMessage 
                  error={applyLayoutMutation.error}
                  message={applyLayoutMutation.error.message || '应用布局失败'}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
