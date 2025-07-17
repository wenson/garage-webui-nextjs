"use client";

import { useState } from "react";
import { useClusterStatus, useHealth } from "@/hooks/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { 
  Server, 
  Activity, 
  HardDrive, 
  Network, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载集群信息..." />
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
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
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
             <Button
          onClick={() => window.location.href = '/cluster/layout'}
          variant="secondary"
          className="flex items-center"
        >
            <Settings className="h-4 w-4 mr-2" />
            布局配置
          </Button>
        </div>
      </div>

      {/* 集群总览 */}
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
            <div className="text-2xl font-bold">{cluster?.nodes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              在线: {cluster?.nodes?.filter(n => n.isUp === true).length || 0}
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

      {/* 节点列表 */}
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
                    <div>
                      <h3 className="font-medium">
                        {node.hostname || node.id?.substring(0, 12) || `节点 ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {node.addr || '地址未知'}
                      </p>
                      {node.role?.zone && (
                        <p className="text-xs text-gray-400">
                          区域: {node.role.zone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {node.role?.tags && node.role.tags.length > 0 && (
                      <div className="text-right">
                        <p className="text-sm font-medium">标签</p>
                        <p className="text-xs text-gray-500">
                          {node.role.tags.join(', ')}
                        </p>
                      </div>
                    )}
                    
                    {node.role?.capacity && (
                      <div className="text-right">
                        <p className="text-sm font-medium">容量</p>
                        <p className="text-xs text-gray-500">
                          {(node.role.capacity / 1024 / 1024 / 1024).toFixed(2)} GB
                        </p>
                      </div>
                    )}
                    
                    {getNodeStatusBadge(node.isUp)}
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

      {/* 集群统计信息 */}
      {cluster && (
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
                  {cluster.nodes?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">在线节点:</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {cluster.nodes?.filter(n => n.isUp === true).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">布局版本:</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {cluster.layoutVersion || '未知'}
                </span>
              </div>
              {cluster.nodes && cluster.nodes.length > 0 && cluster.nodes[0].garageVersion && (
                <div className="flex justify-between">
                  <span className="font-medium">Garage版本:</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {cluster.nodes[0].garageVersion}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
