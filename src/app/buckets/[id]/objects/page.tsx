"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import Button from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useBucketObjects, downloadObject, deleteObject, deleteObjects, S3Object } from "@/hooks/api/objects";
import { ObjectsPageHeader } from "@/components/buckets/objects/objects-page-header";
import { BreadcrumbNavigation } from "@/components/buckets/objects/breadcrumb-navigation";
import { ObjectsSearchAndActions } from "@/components/buckets/objects/objects-search-and-actions";
import { ObjectsList } from "@/components/buckets/objects/objects-list";
import { UploadModal } from "@/components/buckets/objects/upload-modal";

export default function BucketObjectsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const bucketId = params.id as string;
  const bucketName = searchParams.get('name') || bucketId;
  const currentPrefix = searchParams.get('prefix') || '';
  
  // 使用真实的API hook
  const { data: objectsData, isLoading, error, refetch } = useBucketObjects(bucketId, currentPrefix, bucketName);
  const objects = objectsData?.objects || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  
  // 处理面包屑导航
  const pathParts = currentPrefix ? currentPrefix.split('/').filter(Boolean) : [];
  
  const filteredObjects = objects.filter((obj: S3Object) =>
    obj.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFolderClick = (folderKey: string) => {
    const newPrefix = folderKey;
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}&prefix=${newPrefix}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPrefix = pathParts.slice(0, index + 1).join('/') + '/';
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}&prefix=${newPrefix}`);
  };

  const handleRootClick = () => {
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}`);
  };

  const handleBack = () => {
    router.push(`/buckets/${bucketId}?name=${bucketName}`);
  };

  const handleDownload = async (objectKey: string) => {
    try {
      await downloadObject(bucketId, objectKey, bucketName);
      toast.success(`开始下载 ${objectKey}`);
    } catch (downloadError) {
      console.error('下载失败:', downloadError);
      toast.error("下载失败");
    }
  };

  const handleDelete = async (objectKey: string) => {
    try {
      await deleteObject(bucketId, objectKey, bucketName);
      toast.success(`已删除 ${objectKey}`);
      refetch();
    } catch (deleteError) {
      console.error('删除失败:', deleteError);
      toast.error("删除失败");
    }
  };

  const handleUpload = () => {
    setShowUpload(true);
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    refetch();
    toast.success("文件上传完成");
  };

  const toggleObjectSelection = (objectKey: string) => {
    setSelectedObjects(prev =>
      prev.includes(objectKey)
        ? prev.filter(key => key !== objectKey)
        : [...prev, objectKey]
    );
  };

  const handleBatchDelete = async () => {
    if (selectedObjects.length === 0) return;
    
    try {
      await deleteObjects(bucketId, selectedObjects, bucketName);
      toast.success(`已删除 ${selectedObjects.length} 个对象`);
      setSelectedObjects([]);
      refetch();
    } catch (batchDeleteError) {
      console.error('批量删除失败:', batchDeleteError);
      toast.error("批量删除失败");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading text="加载对象列表..." />
      </div>
    );
  }

  if (error) {
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
              对象浏览器
            </h1>
          </div>
        </div>
        
        <ErrorMessage 
          title="无法加载对象列表"
          message={error.message}
          error={error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ObjectsPageHeader
        bucketName={bucketName}
        onUpload={handleUpload}
        onRefresh={() => refetch()}
        onBack={handleBack}
      />

      <BreadcrumbNavigation
        currentPrefix={currentPrefix}
        onBreadcrumbClick={handleBreadcrumbClick}
        onRootClick={handleRootClick}
      />

      <ObjectsSearchAndActions
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedObjects={selectedObjects}
        onBatchDelete={handleBatchDelete}
      />

      <ObjectsList
        objects={filteredObjects}
        selectedObjects={selectedObjects}
        onToggleSelection={toggleObjectSelection}
        onFolderClick={handleFolderClick}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onUpload={handleUpload}
      />

      <UploadModal
        bucketId={bucketId}
        bucketName={bucketName}
        currentPrefix={currentPrefix}
        showUpload={showUpload}
        onUploadComplete={handleUploadComplete}
        onClose={() => setShowUpload(false)}
      />
    </div>
  );
}
