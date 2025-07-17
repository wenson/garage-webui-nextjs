"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBuckets, useCreateBucket, useDeleteBucket } from "@/hooks/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { 
  FolderOpen, 
  Plus, 
  Trash2, 
  Search,
  Database,
  Settings
} from "lucide-react";
import { toast } from "sonner";

import { ErrorMessage } from "@/components/ui/error-message";

export default function BucketsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { data: buckets, isLoading, error, refetch } = useBuckets();
  const createBucket = useCreateBucket();
  const deleteBucket = useDeleteBucket();

  const filteredBuckets = buckets?.filter(bucket =>
    bucket.globalAliases?.some(alias => 
      alias?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || bucket.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      toast.error("请输入存储桶名称");
      return;
    }

    setIsCreating(true);
    try {
      await createBucket.mutateAsync({
        globalAlias: newBucketName
      });
      toast.success("存储桶创建成功");
      setNewBucketName("");
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      // 全局错误处理会显示具体的错误信息
      console.error("Error creating bucket:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBucket = async (bucketId: string, bucketAlias: string) => {
    if (!confirm(`确定要删除存储桶 "${bucketAlias}" 吗？此操作不可撤销。`)) {
      return;
    }

    try {
      await deleteBucket.mutateAsync(bucketId);
      toast.success("存储桶删除成功");
      refetch();
    } catch (error) {
      // 全局错误处理会显示具体的错误信息
      console.error("Error deleting bucket:", error);
    }
  };

  const handleConfigureBucket = (bucketId: string, bucketName: string) => {
    // 跳转到存储桶详情配置页面
    router.push(`/buckets/${bucketId}?name=${encodeURIComponent(bucketName)}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载存储桶..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              存储桶管理
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              管理您的对象存储桶
            </p>
          </div>
        </div>
        
        <ErrorMessage 
          title="无法加载存储桶列表"
          message={error instanceof Error ? error.message : '未知错误'}
          error={error}
          onRetry={() => refetch()}
          showConfigHint={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            存储桶管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            管理您的对象存储桶
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          创建存储桶
        </Button>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索存储桶..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-500">
          共 {buckets?.length || 0} 个存储桶
        </div>
      </div>

      {/* 创建存储桶表单 */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              创建新存储桶
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  存储桶名称
                </label>
                <Input
                  placeholder="输入存储桶名称..."
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateBucket()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  名称必须符合 S3 存储桶命名规范，详见{" "}
                  <a 
                    href="https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    AWS 官方文档
                  </a>
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleCreateBucket}
                  disabled={isCreating}
                >
                  {isCreating ? "创建中..." : "创建"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewBucketName("");
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 存储桶列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBuckets.length > 0 ? (
          filteredBuckets.map((bucket) => {
            const bucketName = bucket.globalAliases[0] || bucket.id;
            const localAliasCount = bucket.localAliases ? Object.keys(bucket.localAliases).length : 0;
            
            return (
              <Card key={bucket.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-lg">{bucketName}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {localAliasCount} 个别名
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    {/* 基本信息 */}
                    <div className="text-sm space-y-1">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Database className="h-4 w-4 mr-2" />
                        ID: <span className="font-mono text-xs ml-1">{bucket.id}</span>
                      </div>
                      
                      {bucket.globalAliases && bucket.globalAliases.length > 0 && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Settings className="h-4 w-4 mr-2" />
                          全局别名: {bucket.globalAliases.join(", ")}
                        </div>
                      )}
                      
                      {bucket.localAliases && Object.keys(bucket.localAliases).length > 0 && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Settings className="h-4 w-4 mr-2" />
                          本地别名: {Object.values(bucket.localAliases).join(", ")}
                        </div>
                      )}
                    </div>

                    {/* 配置信息 */}
                    <div>
                      <p className="text-sm font-medium mb-2">配置状态:</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>网站访问:</span>
                          <Badge variant={bucket.websiteAccess ? "default" : "secondary"}>
                            {bucket.websiteAccess ? "启用" : "禁用"}
                          </Badge>
                        </div>
                        
                        {bucket.corsRules && bucket.corsRules.length > 0 && (
                          <div className="flex items-center justify-between text-xs">
                            <span>CORS 规则:</span>
                            <Badge variant="default">
                              {bucket.corsRules.length} 条规则
                            </Badge>
                          </div>
                        )}
                        
                        {bucket.quotas && (
                          <div className="flex items-center justify-between text-xs">
                            <span>配额设置:</span>
                            <Badge variant="secondary">已配置</Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex justify-between pt-3 border-t">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleConfigureBucket(bucket.id, bucketName)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBucket(bucket.id, bucketName)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? "未找到匹配的存储桶" : "暂无存储桶"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "尝试使用其他关键词搜索" : "创建您的第一个存储桶开始使用"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建存储桶
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
