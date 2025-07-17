"use client";

import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { 
  ArrowLeft,
  Folder,
  File,
  Download,
  Trash2,
  Upload,
  Search,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  Calendar,
  HardDrive
} from "lucide-react";
import { toast } from "sonner";
import { ErrorMessage } from "@/components/ui/error-message";
import { useBucketObjects, downloadObject, deleteObject, deleteObjects, S3Object } from "@/hooks/api/objects";

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
  
  // 处理面包屑导航
  const pathParts = currentPrefix ? currentPrefix.split('/').filter(Boolean) : [];
  
  const filteredObjects = objects.filter((obj: S3Object) =>
    obj.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const handleFolderClick = (folderKey: string) => {
    const newPrefix = folderKey;
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}&prefix=${newPrefix}`);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPrefix = pathParts.slice(0, index + 1).join('/') + '/';
    router.push(`/buckets/${bucketId}/objects?name=${bucketName}&prefix=${newPrefix}`);
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
    // TODO: 实现上传功能
    toast.info("上传功能开发中");
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
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/buckets/${bucketId}?name=${bucketName}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回存储桶
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              对象浏览器
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {bucketName}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </Button>
        </div>
      </div>

      {/* 面包屑导航 */}
      {currentPrefix && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center space-x-2 text-sm">
              <FolderOpen className="h-4 w-4" />
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-normal"
                onClick={() => router.push(`/buckets/${bucketId}/objects?name=${bucketName}`)}
              >
                根目录
              </Button>
              {pathParts.map((part, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 font-normal"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {part}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索和批量操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索对象..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          {selectedObjects.length > 0 && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                已选择 {selectedObjects.length} 个对象
              </Badge>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 对象列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            对象列表 ({filteredObjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredObjects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">没有找到对象</p>
              <Button onClick={handleUpload}>
                <Upload className="h-4 w-4 mr-2" />
                上传第一个文件
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredObjects.map((object: S3Object) => (
                <div
                  key={object.key}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedObjects.includes(object.key)}
                      onChange={() => toggleObjectSelection(object.key)}
                      className="rounded"
                    />
                    
                    {object.isFolder ? (
                      <Folder className="h-5 w-5 text-blue-500" />
                    ) : (
                      <File className="h-5 w-5 text-gray-500" />
                    )}
                    
                    <div className="flex-1">
                      {object.isFolder ? (
                        <button
                          onClick={() => handleFolderClick(object.key)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {object.key}
                        </button>
                      ) : (
                        <span className="font-medium">{object.key}</span>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        {!object.isFolder && (
                          <>
                            <div className="flex items-center">
                              <HardDrive className="h-3 w-3 mr-1" />
                              {formatBytes(object.size)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(object.lastModified)}
                            </div>
                          </>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {object.storageClass}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {!object.isFolder && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(object.key)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(object.key)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
