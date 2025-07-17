"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { 
  ArrowLeft,
  Settings, 
  Globe,
  Shield,
  Database,
  HardDrive,
  FileText,
  Copy,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useBucket, useUpdateBucket, useBuckets } from "@/hooks/api/buckets";
import { GetBucketInfoResponse } from "@/types/garage-api-v2";

export default function BucketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const bucketId = params.id as string;
  const bucketName = searchParams.get('name') || bucketId;
  
  // 使用真实的API hooks，如果单个存储桶API失败，尝试从列表中获取
  const { data: bucketData, isLoading: bucketLoading, error: bucketError, refetch } = useBucket(bucketId);
  const { data: buckets, isLoading: bucketsLoading } = useBuckets();
  const updateBucketMutation = useUpdateBucket();
  
  // 如果单个存储桶API失败，从列表中查找
  const fallbackBucket = buckets?.find(b => b.id === bucketId);
  const bucket = bucketData || fallbackBucket;
  const isLoading = bucketLoading || (bucketError && bucketsLoading);
  const error = bucketError && !fallbackBucket ? bucketError : null;
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    websiteAccess: false,
    indexDocument: '',
    errorDocument: '',
    maxSize: '',
    maxObjects: ''
  });

  useEffect(() => {
    if (bucket) {
      // 根据实际API返回数据，bucket 现在应该包含 GetBucketInfoResponse 的所有字段
      const bucketInfo = bucket as GetBucketInfoResponse;
      const websiteConfig = bucketInfo.websiteConfig;
      setFormData({
        websiteAccess: bucketInfo.websiteAccess || false,
        indexDocument: websiteConfig?.indexDocument || '',
        errorDocument: websiteConfig?.errorDocument || '',
        maxSize: bucketInfo.quotas?.maxSize ? (bucketInfo.quotas.maxSize / 1024 / 1024).toString() : '',
        maxObjects: bucketInfo.quotas?.maxObjects?.toString() || ''
      });
    }
  }, [bucket]);

  const handleSave = async () => {
    try {
      // 构建更新请求
      const updateConfig = {
        websiteAccess: {
          enabled: formData.websiteAccess,
          indexDocument: formData.indexDocument || undefined,
          errorDocument: formData.errorDocument || undefined
        },
        quotas: {
          maxSize: formData.maxSize ? parseInt(formData.maxSize) * 1024 * 1024 : null,
          maxObjects: formData.maxObjects ? parseInt(formData.maxObjects) : null
        }
      };

      await updateBucketMutation.mutateAsync({ bucketId, config: updateConfig });
      toast.success("存储桶配置已更新");
      setIsEditing(false);
    } catch (saveError) {
      console.error('保存失败:', saveError);
      toast.error("保存失败");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载存储桶信息..." />
      </div>
    );
  }

  if (error || !bucket) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              存储桶详情
            </h1>
          </div>
        </div>
        
        <ErrorMessage 
          title="无法加载存储桶信息"
          message={error?.message || '存储桶不存在'}
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {bucketName}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              存储桶配置和管理
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => router.push(`/buckets/${bucketId}/objects?name=${bucketName}`)}
          >
            <FileText className="h-4 w-4 mr-2" />
            浏览对象
          </Button>
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button onClick={handleSave}>
                保存更改
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              编辑配置
            </Button>
          )}
        </div>
      </div>

      {/* 基本信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">对象数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(bucket as GetBucketInfoResponse).objects || 0}</div>
            <p className="text-xs text-muted-foreground">
              个文件对象
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">存储大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes((bucket as GetBucketInfoResponse).bytes || 0)}</div>
            <p className="text-xs text-muted-foreground">
              已使用空间
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">访问密钥</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(bucket as GetBucketInfoResponse).keys?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              个授权密钥
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">未完成上传</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(bucket as GetBucketInfoResponse).unfinishedUploads || 0}</div>
            <p className="text-xs text-muted-foreground">
              个待完成
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 存储桶信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            存储桶信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">存储桶ID</label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={bucket.id}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bucket.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">全局别名</label>
                <div className="flex flex-wrap gap-2">
                  {bucket.globalAliases?.map((alias: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {alias}
                    </Badge>
                  ))}
                  {bucket.globalAliases?.length === 0 && (
                    <span className="text-sm text-gray-500">无</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 网站配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            网站配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="websiteAccess"
                checked={formData.websiteAccess}
                onChange={(e) => setFormData({ ...formData, websiteAccess: e.target.checked })}
                disabled={!isEditing}
                className="rounded"
              />
              <label htmlFor="websiteAccess" className="text-sm font-medium">
                启用静态网站托管
              </label>
            </div>

            {formData.websiteAccess && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm font-medium mb-2">索引文档</label>
                  <Input
                    placeholder="index.html"
                    value={formData.indexDocument}
                    onChange={(e) => setFormData({ ...formData, indexDocument: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">错误文档</label>
                  <Input
                    placeholder="error.html"
                    value={formData.errorDocument}
                    onChange={(e) => setFormData({ ...formData, errorDocument: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 配额设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="h-5 w-5 mr-2" />
            配额设置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">最大存储空间 (MB)</label>
              <Input
                type="number"
                placeholder="无限制"
                value={formData.maxSize}
                onChange={(e) => setFormData({ ...formData, maxSize: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最大对象数量</label>
              <Input
                type="number"
                placeholder="无限制"
                value={formData.maxObjects}
                onChange={(e) => setFormData({ ...formData, maxObjects: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* S3 连接信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="h-5 w-5 mr-2" />
            S3 连接信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Endpoint URL</label>
              <div className="flex items-center space-x-2">
                <Input
                  value="http://localhost:3900"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard("http://localhost:3900")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bucket Name</label>
              <div className="flex items-center space-x-2">
                <Input
                  value={bucket.globalAliases?.[0] || bucket.id}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(bucket.globalAliases?.[0] || bucket.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
