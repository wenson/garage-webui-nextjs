"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { Folder, Upload } from "lucide-react";
import { S3Object } from "@/hooks/api/objects";
import { ObjectListItem } from "./object-list-item";

interface ObjectsListProps {
  objects: S3Object[];
  selectedObjects: string[];
  onToggleSelection: (objectKey: string) => void;
  onFolderClick: (folderKey: string) => void;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onUpload: () => void;
  onObjectDetail?: (object: S3Object) => void;
  errorMessage?: string;
}

export function ObjectsList({
  objects,
  selectedObjects,
  onToggleSelection,
  onFolderClick,
  onDownload,
  onDelete,
  onUpload,
  onObjectDetail,
  errorMessage
}: ObjectsListProps) {
  if (objects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Folder className="h-5 w-5 mr-2" />
            对象列表 (0)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {errorMessage ? (
              <>
                <p className="text-red-500 mb-2">配置错误</p>
                <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">{errorMessage}</p>
                <p className="text-xs text-gray-500 mb-4">
                  请检查 S3 认证配置或确保存在有效的访问密钥
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-2">没有找到对象</p>
                <Button onClick={onUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  上传第一个文件
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Folder className="h-5 w-5 mr-2" />
          对象列表 ({objects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {objects.map((object: S3Object) => (
            <ObjectListItem
              key={object.key}
              object={object}
              isSelected={selectedObjects.includes(object.key)}
              onToggleSelection={onToggleSelection}
              onFolderClick={onFolderClick}
              onDownload={onDownload}
              onDelete={onDelete}
              onDetail={onObjectDetail}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
