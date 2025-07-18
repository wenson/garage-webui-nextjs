import React, { useState } from 'react';
import { S3Object } from '@/hooks/api/objects';
import ObjectDetailModal from './object-detail-modal';
import Button from '@/components/ui/button';
import { Eye, FileText, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useInspectObject } from '@/hooks/api/use-inspect-object';

interface ObjectItemProps {
  object: S3Object;
  bucketId: string;
  bucketName?: string;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onRename?: (oldKey: string, newKey: string) => void;
}

const ObjectItem: React.FC<ObjectItemProps> = ({
  object,
  bucketId,
  bucketName,
  onDownload,
  onDelete,
  onRename
}) => {
  const [showDetail, setShowDetail] = useState(false);
  const [showVersionStatus, setShowVersionStatus] = useState(false);

  // 快速获取版本状态用于显示指示器
  const { data: inspectData } = useInspectObject({
    bucketId,
    key: object.key,
    enabled: showVersionStatus
  });

  const getVersionStatusBadge = () => {
    if (!inspectData?.versions) return null;

    const hasUploading = inspectData.versions.some(v => v.uploading);
    const hasAborted = inspectData.versions.some(v => v.aborted);
    const hasDeleted = inspectData.versions.some(v => v.deleteMarker);
    const versionCount = inspectData.versions.length;

    if (hasUploading) {
      return <Badge variant="warning" className="text-xs">上传中</Badge>;
    }
    if (hasAborted) {
      return <Badge variant="destructive" className="text-xs">有错误</Badge>;
    }
    if (hasDeleted) {
      return <Badge variant="secondary" className="text-xs">有删除</Badge>;
    }
    if (versionCount > 1) {
      return <Badge variant="default" className="text-xs">{versionCount} 版本</Badge>;
    }

    return null;
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{object.key}</div>
            <div className="text-xs text-gray-500">
              {object.size && `${(object.size / 1024).toFixed(1)} KB`} • 
              {object.lastModified && new Date(object.lastModified).toLocaleDateString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getVersionStatusBadge()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersionStatus(!showVersionStatus)}
            title="显示版本状态"
          >
            <Clock className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetail(true)}
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ObjectDetailModal
        object={object}
        bucketId={bucketId}
        bucketName={bucketName}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onDownload={onDownload}
        onDelete={onDelete}
        onRename={onRename}
      />
    </>
  );
};

export default ObjectItem;
