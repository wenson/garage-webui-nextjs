"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBuckets, useCreateBucket, useDeleteBucket } from "@/hooks/api";
import { Loading } from "@/components/ui/loading";
import { ErrorMessage } from "@/components/ui/error-message";
import { toast } from "sonner";

// 存储桶组件
import { BucketsPageHeader } from "@/components/buckets/buckets-page-header";
import { BucketsSearchBar } from "@/components/buckets/buckets-search-bar";
import { CreateBucketForm } from "@/components/buckets/create-bucket-form";
import { BucketsList } from "@/components/buckets/buckets-list";

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
      console.error("Error deleting bucket:", error);
    }
  };

  const handleConfigureBucket = (bucketId: string, bucketName: string) => {
    router.push(`/buckets/${bucketId}?name=${encodeURIComponent(bucketName)}`);
  };

  const handleCreateFormCancel = () => {
    setShowCreateForm(false);
    setNewBucketName("");
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
        <BucketsPageHeader onCreateBucket={() => setShowCreateForm(true)} />
        
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
      <BucketsPageHeader onCreateBucket={() => setShowCreateForm(true)} />

      {/* 搜索栏 */}
      <BucketsSearchBar 
        searchTerm={searchTerm}
        totalCount={buckets?.length || 0}
        onSearchChange={setSearchTerm}
      />

      {/* 创建存储桶表单 */}
      <CreateBucketForm 
        show={showCreateForm}
        bucketName={newBucketName}
        isCreating={isCreating}
        onBucketNameChange={setNewBucketName}
        onSubmit={handleCreateBucket}
        onCancel={handleCreateFormCancel}
      />

      {/* 存储桶列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BucketsList 
          buckets={filteredBuckets}
          searchTerm={searchTerm}
          onConfigure={handleConfigureBucket}
          onDelete={handleDeleteBucket}
          onCreateBucket={() => setShowCreateForm(true)}
        />
      </div>
    </div>
  );
}
