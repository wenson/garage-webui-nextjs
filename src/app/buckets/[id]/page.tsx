"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";
import { useBucket, useUpdateBucket, useBuckets } from "@/hooks/api/buckets";
import { GetBucketInfoResponse } from "@/types/garage-api-v2";

// 存储桶详情组件
import { BucketDetailHeader } from "@/components/buckets/detail/bucket-detail-header";
import { BucketStatsOverview } from "@/components/buckets/detail/bucket-stats-overview";
import { BucketInfoCard } from "@/components/buckets/detail/bucket-info-card";
import { WebsiteConfigCard } from "@/components/buckets/detail/website-config-card";
import { QuotaConfigCard } from "@/components/buckets/detail/quota-config-card";
import { S3ConnectionInfo } from "@/components/buckets/detail/s3-connection-info";

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

  const handleFormDataChange = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleBrowseObjects = () => {
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}`);
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
        <BucketDetailHeader
          bucketName="存储桶详情"
          isEditing={false}
          onBack={() => router.back()}
          onBrowseObjects={() => {}}
          onEditToggle={() => {}}
          onCancel={() => {}}
          onSave={() => {}}
        />
        
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
      <BucketDetailHeader
        bucketName={bucketName}
        isEditing={isEditing}
        onBack={() => router.back()}
        onBrowseObjects={handleBrowseObjects}
        onEditToggle={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSave}
      />

      {/* 存储桶统计概览 */}
      <BucketStatsOverview 
        bucket={bucket as GetBucketInfoResponse}
        formatBytes={formatBytes}
      />

      {/* 存储桶基本信息 */}
      <BucketInfoCard 
        bucket={bucket}
        onCopyToClipboard={copyToClipboard}
      />

      {/* 网站配置 */}
      <WebsiteConfigCard 
        formData={{
          websiteAccess: formData.websiteAccess,
          indexDocument: formData.indexDocument,
          errorDocument: formData.errorDocument
        }}
        isEditing={isEditing}
        onFormDataChange={handleFormDataChange}
      />

      {/* 配额设置 */}
      <QuotaConfigCard 
        formData={{
          maxSize: formData.maxSize,
          maxObjects: formData.maxObjects
        }}
        isEditing={isEditing}
        onFormDataChange={handleFormDataChange}
      />

      {/* S3 连接信息 */}
      <S3ConnectionInfo 
        bucket={bucket}
        onCopyToClipboard={copyToClipboard}
      />
    </div>
  );
}
