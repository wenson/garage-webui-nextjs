import React, { useState, useMemo } from 'react';
import { S3Object } from '@/hooks/api/objects';
import { useInspectObject } from '@/hooks/api/use-inspect-object';
import { InspectObjectVersion } from '@/types/garage-api-v2';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  File, 
  Folder, 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Clock, 
  Shield, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  Hash,
  Info
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface EnhancedObjectItemProps {
  object: S3Object;
  bucketId: string;
  bucketName?: string;
  isSelected: boolean;
  onToggleSelection: (objectKey: string) => void;
  onFolderClick?: (folderKey: string) => void;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onDetail?: (object: S3Object) => void;
  showVersionDetails?: boolean;
}

const EnhancedObjectItem: React.FC<EnhancedObjectItemProps> = ({
  object,
  bucketId,
  isSelected,
  onToggleSelection,
  onFolderClick,
  onDownload,
  onDelete,
  onDetail,
  showVersionDetails = true
}) => {
  const [showVersions, setShowVersions] = useState(false);
  
  // 获取对象的详细版本信息
  const { data: inspectData, isLoading: isInspecting } = useInspectObject({
    bucketId,
    key: object.key,
    enabled: showVersionDetails && !object.isFolder
  });

  // 分析版本状态
  const versionSummary = useMemo(() => {
    if (!inspectData?.versions) return null;

    const versions = inspectData.versions;
    const latestVersion = versions[0]; // 假设按时间倒序排列
    
    const summary = {
      total: versions.length,
      uploading: versions.filter(v => v.uploading).length,
      aborted: versions.filter(v => v.aborted).length,
      deleted: versions.filter(v => v.deleteMarker).length,
      encrypted: versions.filter(v => v.encrypted).length,
      inline: versions.filter(v => v.inline).length,
      blocks: versions.filter(v => v.blocks && v.blocks.length > 0).length,
      latest: latestVersion
    };

    return summary;
  }, [inspectData]);

  // 获取状态徽章
  const getStatusBadges = () => {
    if (!versionSummary) return null;

    const badges = [];

    // 版本数量
    if (versionSummary.total > 1) {
      badges.push(
        <Badge key="versions" variant="default" className="text-xs">
          {versionSummary.total} 版本
        </Badge>
      );
    }

    // 上传状态
    if (versionSummary.uploading > 0) {
      badges.push(
        <Badge key="uploading" variant="warning" className="text-xs">
          <Upload className="w-3 h-3 mr-1" />
          上传中 ({versionSummary.uploading})
        </Badge>
      );
    }

    // 错误状态
    if (versionSummary.aborted > 0) {
      badges.push(
        <Badge key="aborted" variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          已中止 ({versionSummary.aborted})
        </Badge>
      );
    }

    // 删除标记
    if (versionSummary.deleted > 0) {
      badges.push(
        <Badge key="deleted" variant="secondary" className="text-xs">
          <Trash2 className="w-3 h-3 mr-1" />
          删除标记 ({versionSummary.deleted})
        </Badge>
      );
    }

    // 加密状态
    if (versionSummary.encrypted > 0) {
      badges.push(
        <Badge key="encrypted" variant="success" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          加密
        </Badge>
      );
    }

    return badges;
  };

  // 获取存储类型信息
  const getStorageInfo = () => {
    if (!versionSummary?.latest) return null;

    const latest = versionSummary.latest;
    const storageType = latest.inline ? '内联存储' : latest.blocks ? '分块存储' : '未知';
    const icon = latest.inline ? Database : Hash;

    return {
      type: storageType,
      icon,
      size: latest.size,
      encrypted: latest.encrypted
    };
  };

  const handleClick = () => {
    if (object.isFolder && onFolderClick) {
      onFolderClick(object.key);
    } else if (onDetail) {
      onDetail(object);
    }
  };

  const storageInfo = getStorageInfo();

  return (
    <Card className={`p-4 hover:bg-gray-50 transition-colors ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="space-y-3">
        {/* 主要信息行 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 选择复选框 */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelection(object.key)}
              className="w-4 h-4"
            />

            {/* 文件图标 */}
            {object.isFolder ? (
              <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
            ) : (
              <File className="w-5 h-5 text-gray-500 flex-shrink-0" />
            )}

            {/* 文件信息 */}
            <div className="flex-1 min-w-0">
              <div 
                className="font-medium text-sm truncate cursor-pointer hover:text-blue-600"
                onClick={handleClick}
              >
                {object.key}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                {!object.isFolder && (
                  <>
                    <span>{formatBytes(object.size)}</span>
                    <span>{formatDate(object.lastModified)}</span>
                    {storageInfo && (
                      <div className="flex items-center gap-1">
                        <storageInfo.icon className="w-3 h-3" />
                        <span>{storageInfo.type}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {!object.isFolder && showVersionDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
                title="版本详情"
                disabled={isInspecting}
              >
                {isInspecting ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </Button>
            )}

            {!object.isFolder && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDownload(object.key)}
                  title="下载"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDetail?.(object)}
                  title="详情"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(object.key)}
                  title="删除"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 状态徽章 */}
        {!object.isFolder && versionSummary && (
          <div className="flex flex-wrap gap-2">
            {getStatusBadges()}
          </div>
        )}

        {/* 版本详情（可展开） */}
        {!object.isFolder && showVersions && versionSummary && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-sm font-medium text-gray-700">
              版本详情 ({versionSummary.total})
            </div>
            
            {inspectData?.versions.slice(0, 3).map((version, index) => (
              <VersionSummaryItem key={version.uuid} version={version} index={index} />
            ))}
            
            {versionSummary.total > 3 && (
              <div className="text-xs text-gray-500 text-center py-2">
                还有 {versionSummary.total - 3} 个版本...
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// 版本摘要组件
const VersionSummaryItem: React.FC<{ 
  version: InspectObjectVersion; 
  index: number;
}> = ({ version, index }) => {
  const getStatusIcon = () => {
    if (version.uploading) return <Upload className="w-3 h-3 text-blue-500" />;
    if (version.aborted) return <XCircle className="w-3 h-3 text-red-500" />;
    if (version.deleteMarker) return <Trash2 className="w-3 h-3 text-gray-500" />;
    return <CheckCircle className="w-3 h-3 text-green-500" />;
  };

  const getStatusText = () => {
    if (version.uploading) return '上传中';
    if (version.aborted) return '已中止';
    if (version.deleteMarker) return '删除标记';
    return '完成';
  };

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="font-medium">版本 {index + 1}</span>
        <span className="text-gray-500">{formatDate(version.timestamp)}</span>
      </div>
      
      <div className="flex items-center gap-2">
        {version.size && (
          <span className="text-gray-600">{formatBytes(version.size)}</span>
        )}
        {version.encrypted && (
          <div title="已加密">
            <Shield className="w-3 h-3 text-green-500" />
          </div>
        )}
        <Badge variant="secondary" className="text-xs">
          {getStatusText()}
        </Badge>
      </div>
    </div>
  );
};

// 增强版对象列表组件
interface EnhancedObjectsListProps {
  objects: S3Object[];
  bucketId: string;
  bucketName?: string;
  selectedObjects: string[];
  onToggleSelection: (objectKey: string) => void;
  onFolderClick: (folderKey: string) => void;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onDetail?: (object: S3Object) => void;
  errorMessage?: string;
  showVersionDetails?: boolean;
}

export const EnhancedObjectsList: React.FC<EnhancedObjectsListProps> = ({
  objects,
  bucketId,
  bucketName,
  selectedObjects,
  onToggleSelection,
  onFolderClick,
  onDownload,
  onDelete,
  onDetail,
  errorMessage,
  showVersionDetails = true
}) => {
  if (errorMessage) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 font-medium mb-2">配置错误</p>
          <p className="text-sm text-gray-600 max-w-md mx-auto">{errorMessage}</p>
        </div>
      </Card>
    );
  }

  if (objects.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-medium mb-2">此文件夹为空</p>
          <p className="text-sm text-gray-400">上传一些文件开始使用</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          对象列表 ({objects.length})
        </h3>
        {showVersionDetails && (
          <Badge variant="secondary" className="text-xs">
            <Info className="w-3 h-3 mr-1" />
            增强版本信息
          </Badge>
        )}
      </div>

      {objects.map((object) => (
        <EnhancedObjectItem
          key={object.key}
          object={object}
          bucketId={bucketId}
          bucketName={bucketName}
          isSelected={selectedObjects.includes(object.key)}
          onToggleSelection={onToggleSelection}
          onFolderClick={onFolderClick}
          onDownload={onDownload}
          onDelete={onDelete}
          onDetail={onDetail}
          showVersionDetails={showVersionDetails}
        />
      ))}
    </div>
  );
};

export default EnhancedObjectsList;
