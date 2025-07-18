"use client";

import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { 
  Folder,
  File,
  Download,
  Trash2,
  HardDrive,
  Calendar,
  Eye
} from "lucide-react";
import { S3Object } from "@/hooks/api/objects";

interface ObjectListItemProps {
  object: S3Object;
  isSelected: boolean;
  onToggleSelection: (objectKey: string) => void;
  onFolderClick: (folderKey: string) => void;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onDetail?: (object: S3Object) => void;
}

export function ObjectListItem({
  object,
  isSelected,
  onToggleSelection,
  onFolderClick,
  onDownload,
  onDelete,
  onDetail
}: ObjectListItemProps) {
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

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(object.key)}
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
              onClick={() => onFolderClick(object.key)}
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
          {onDetail && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDetail(object)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDownload(object.key)}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(object.key)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
