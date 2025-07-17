import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GarageClusterStatus } from "@/types";
import { Server } from "lucide-react";

interface ClusterOverviewProps {
  cluster?: GarageClusterStatus;
}

export default function ClusterOverview({ cluster }: ClusterOverviewProps) {
  if (!cluster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            集群概览
          </CardTitle>
          <CardDescription>集群状态信息</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            暂无集群数据
          </p>
        </CardContent>
      </Card>
    );
  }

  const getNodeStatusBadge = (isUp?: boolean) => {
    if (isUp === true) {
      return <Badge variant="success">在线</Badge>;
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
          集群概览
        </CardTitle>
        <CardDescription>
          {cluster.nodes?.length || 0} 个节点
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 集群信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">布局版本</p>
              <p className="font-semibold">
                {cluster.layoutVersion || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">在线节点</p>
              <p className="font-semibold">
                {cluster.nodes?.filter(n => n.isUp === true).length || 0} / {cluster.nodes?.length || 0}
              </p>
            </div>
          </div>

          {/* 节点列表 */}
          {cluster.nodes && cluster.nodes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                节点状态
              </h4>
              <div className="space-y-2">
                {cluster.nodes.slice(0, 5).map((node, index) => (
                  <div
                    key={node.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-sm font-medium">
                            {node.hostname || node.id?.substring(0, 12) || `节点 ${index + 1}`}
                          </span>
                          {node.role?.zone && (
                            <p className="text-xs text-gray-500">
                              区域: {node.role.zone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getNodeStatusBadge(node.isUp)}
                    </div>
                  </div>
                ))}
                
                {cluster.nodes.length > 5 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    还有 {cluster.nodes.length - 5} 个节点...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
