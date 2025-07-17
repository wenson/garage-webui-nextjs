import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>最近活动</span>
        </CardTitle>
        <CardDescription>
          查看集群中的最新操作记录
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-sm">暂无活动记录</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}