"use client";

import Button from "@/components/ui/button";
import { ArrowLeft, Upload, RefreshCw } from "lucide-react";

interface ObjectsPageHeaderProps {
  bucketName: string;
  onUpload: () => void;
  onRefresh: () => void;
  onBack: () => void;
}

export function ObjectsPageHeader({
  bucketName,
  onUpload,
  onRefresh,
  onBack
}: ObjectsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
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
          onClick={onRefresh}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          刷新
        </Button>
        <Button onClick={onUpload}>
          <Upload className="h-4 w-4 mr-2" />
          上传文件
        </Button>
      </div>
    </div>
  );
}
