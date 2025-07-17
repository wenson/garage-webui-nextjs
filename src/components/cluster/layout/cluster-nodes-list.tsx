'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Server, CheckCircle, XCircle, AlertTriangle, Plus } from 'lucide-react';
import { GarageClusterStatus } from '@/types';

interface ClusterNodesListProps {
  cluster?: GarageClusterStatus;
  onSelectNode: (nodeId: string) => void;
}

export function ClusterNodesList({ cluster, onSelectNode }: ClusterNodesListProps) {
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
                      onClick={() => onSelectNode(node.id)}
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
  );
}
