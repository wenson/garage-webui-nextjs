import React, { useState } from 'react';
import { S3Object } from '@/hooks/api/objects';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, Eye, Edit2, Trash2, ExternalLink, Info, Clock } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils';
import { useInspectObject } from '@/hooks/api/use-inspect-object';
import ObjectVersionDetails from './object-version-details';

interface ObjectDetailModalProps {
  object: S3Object | null;
  bucketId: string;
  bucketName?: string;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onRename?: (oldKey: string, newKey: string) => void;
}

const ObjectDetailModal: React.FC<ObjectDetailModalProps> = ({
  object,
  bucketId,
  bucketName,
  isOpen,
  onClose,
  onDownload,
  onDelete,
  onRename
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState<'info' | 'versions'>('info');

  // 获取对象详细信息
  const { data: inspectData, isLoading: isInspecting } = useInspectObject({
    bucketId,
    key: object?.key || '',
    enabled: isOpen && !!object && activeTab === 'versions'
  });

  if (!isOpen || !object) return null;

  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(object.key);
  const isText = /\.(txt|md|json|js|ts|tsx|jsx|css|html|xml|yml|yaml|log)$/i.test(object.key);
  const isPdf = /\.pdf$/i.test(object.key);

  const handleRename = () => {
    if (onRename && newName.trim() && newName !== object.key) {
      const parts = object.key.split('/');
      parts[parts.length - 1] = newName.trim();
      const newKey = parts.join('/');
      onRename(object.key, newKey);
      setIsRenaming(false);
      setNewName('');
      onClose();
    }
  };

  const getPreviewUrl = () => {
    const params = new URLSearchParams();
    params.set('objectKey', object.key);
    if (bucketName) params.set('bucketName', bucketName);
    return `/api/garage/bucket/${bucketId}/download?${params}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-3 py-1 border rounded text-sm"
                  placeholder="输入新名称"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') {
                      setIsRenaming(false);
                      setNewName('');
                    }
                  }}
                />
                <Button size="sm" onClick={handleRename}>
                  保存
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={() => {
                    setIsRenaming(false);
                    setNewName('');
                  }}
                >
                  取消
                </Button>
              </div>
            ) : (
              <h2 className="text-lg font-semibold truncate">{object.key}</h2>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-8">
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('info')}
            >
              <Info className="w-4 h-4 inline mr-2" />
              基本信息
            </button>
            <button
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'versions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('versions')}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              版本详情
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Object Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">大小</label>
                  <p className="text-sm font-mono">{formatBytes(object.size)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">修改时间</label>
                  <p className="text-sm">{formatDate(object.lastModified)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">存储类型</label>
                  <p className="text-sm">
                    <Badge variant="secondary">{object.storageClass}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">ETag</label>
                  <p className="text-sm font-mono truncate">{object.etag}</p>
                </div>
              </div>

              {/* Preview Section */}
              {(isImage || isText || isPdf) && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium">预览</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreview ? '隐藏预览' : '显示预览'}
                    </Button>
                  </div>

                  {showPreview && (
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto">
                      {isImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getPreviewUrl()}
                          alt={object.key}
                          className="max-w-full h-auto"
                        />
                      )}
                      
                      {isText && (
                        <iframe
                          src={getPreviewUrl()}
                          className="w-full h-80 border-0"
                          title={`预览: ${object.key}`}
                        />
                      )}
                      
                      {isPdf && (
                        <iframe
                          src={getPreviewUrl()}
                          className="w-full h-80 border-0"
                          title={`预览: ${object.key}`}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'versions' && (
            <div>
              {isInspecting ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">正在加载版本信息...</div>
                </div>
              ) : inspectData ? (
                <ObjectVersionDetails versions={inspectData.versions} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>无法获取版本信息</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t flex justify-between">
          <div className="flex gap-2">
            {onRename && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setNewName(object.key.split('/').pop() || '');
                  setIsRenaming(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                重命名
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(getPreviewUrl(), '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              在新窗口打开
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDownload(object.key)}
            >
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                onDelete(object.key);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              删除
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ObjectDetailModal;
