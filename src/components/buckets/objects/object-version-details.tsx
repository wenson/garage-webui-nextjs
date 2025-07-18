import React, { useState } from 'react';
import { InspectObjectVersion, InspectObjectBlock } from '@/types/garage-api-v2';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Shield, 
  Upload, 
  Trash, 
  FileX, 
  Database,
  Hash,
  Info
} from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';

interface ObjectVersionDetailsProps {
  versions: InspectObjectVersion[];
}

const ObjectVersionDetails: React.FC<ObjectVersionDetailsProps> = ({
  versions
}) => {
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

  const toggleVersion = (uuid: string) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(uuid)) {
      newExpanded.delete(uuid);
    } else {
      newExpanded.add(uuid);
    }
    setExpandedVersions(newExpanded);
  };

  const toggleBlocks = (uuid: string) => {
    const newExpanded = new Set(expandedBlocks);
    if (newExpanded.has(uuid)) {
      newExpanded.delete(uuid);
    } else {
      newExpanded.add(uuid);
    }
    setExpandedBlocks(newExpanded);
  };

  const getVersionStatus = (version: InspectObjectVersion) => {
    if (version.uploading) return { status: 'uploading', color: 'bg-blue-500', text: '上传中' };
    if (version.aborted) return { status: 'aborted', color: 'bg-red-500', text: '已中止' };
    if (version.deleteMarker) return { status: 'deleted', color: 'bg-gray-500', text: '已删除' };
    return { status: 'complete', color: 'bg-green-500', text: '完成' };
  };

  const getStorageType = (version: InspectObjectVersion) => {
    if (version.inline) return { type: 'inline', text: '内联存储', icon: Database };
    if (version.blocks && version.blocks.length > 0) return { type: 'blocks', text: '分块存储', icon: Hash };
    return { type: 'unknown', text: '未知', icon: Info };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <h3 className="text-lg font-semibold">版本历史 ({versions.length})</h3>
      </div>

      {versions.map((version, index) => {
        const status = getVersionStatus(version);
        const storage = getStorageType(version);
        const isExpanded = expandedVersions.has(version.uuid);
        const isBlocksExpanded = expandedBlocks.has(version.uuid);

        return (
          <Card key={version.uuid} className="p-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleVersion(version.uuid)}
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    版本 {index + 1}
                  </Badge>
                  <Badge className={`text-white text-xs ${status.color}`}>
                    {status.text}
                  </Badge>
                  {version.encrypted && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      加密
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-500">
                {formatDate(version.timestamp)}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">UUID:</span>
                    <div className="font-mono text-xs text-gray-600 break-all">
                      {version.uuid}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">大小:</span>
                    <div className="text-gray-600">
                      {version.size ? formatBytes(version.size) : '未知'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ETag:</span>
                    <div className="font-mono text-xs text-gray-600 break-all">
                      {version.etag || '无'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">存储方式:</span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <storage.icon className="w-3 h-3" />
                      {storage.text}
                    </div>
                  </div>
                </div>

                {/* 状态指示器 */}
                <div className="flex flex-wrap gap-2">
                  {version.uploading && (
                    <Badge variant="secondary" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      上传中
                    </Badge>
                  )}
                  {version.aborted && (
                    <Badge variant="destructive" className="text-xs">
                      <FileX className="w-3 h-3 mr-1" />
                      已中止
                    </Badge>
                  )}
                  {version.deleteMarker && (
                    <Badge variant="secondary" className="text-xs">
                      <Trash className="w-3 h-3 mr-1" />
                      删除标记
                    </Badge>
                  )}
                  {version.encrypted && (
                    <Badge variant="secondary" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      已加密
                    </Badge>
                  )}
                </div>

                {/* HTTP 头信息 */}
                {version.headers && version.headers.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700 text-sm">HTTP 头:</span>
                    <div className="mt-1 bg-gray-50 rounded p-2 text-xs font-mono max-h-32 overflow-y-auto">
                      {version.headers.map(([key, value], idx) => (
                        <div key={idx} className="text-gray-600">
                          <span className="text-blue-600">{key}:</span> {value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 数据块信息 */}
                {version.blocks && version.blocks.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700 text-sm">
                        数据块 ({version.blocks.length})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlocks(version.uuid);
                        }}
                        className="text-xs"
                      >
                        {isBlocksExpanded ? '收起' : '展开'}
                        {isBlocksExpanded ? (
                          <ChevronDown className="w-3 h-3 ml-1" />
                        ) : (
                          <ChevronRight className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    </div>

                    {isBlocksExpanded && (
                      <div className="mt-2 space-y-2">
                        {version.blocks.map((block, blockIdx) => (
                          <BlockInfo key={blockIdx} block={block} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// 数据块信息组件
const BlockInfo: React.FC<{ block: InspectObjectBlock }> = ({ block }) => {
  return (
    <div className="bg-gray-50 rounded p-3 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <span className="font-medium text-gray-700">分片:</span>
          <span className="ml-2 text-gray-600">#{block.partNumber}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">大小:</span>
          <span className="ml-2 text-gray-600">{formatBytes(block.size)}</span>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">偏移:</span>
          <span className="ml-2 text-gray-600">{block.offset}</span>
        </div>
        <div className="col-span-2">
          <span className="font-medium text-gray-700">哈希:</span>
          <div className="font-mono text-xs text-gray-600 break-all mt-1">
            {block.hash}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectVersionDetails;
