// 使用示例：在对象页面中集成增强版列表

import React, { useState } from 'react';
import { EnhancedObjectsList } from '@/components/buckets/objects/enhanced-objects-list';
import ObjectDetailModal from '@/components/buckets/objects/object-detail-modal';
import { S3Object } from '@/hooks/api/objects';
import Button from '@/components/ui/button';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface ObjectsPageExampleProps {
  objects: S3Object[];
  bucketId: string;
  bucketName?: string;
  onDownload: (objectKey: string) => void;
  onDelete: (objectKey: string) => void;
  onFolderClick: (folderKey: string) => void;
}

export const ObjectsPageExample: React.FC<ObjectsPageExampleProps> = ({
  objects,
  bucketId,
  bucketName,
  onDownload,
  onDelete,
  onFolderClick
}) => {
  const [selectedObjects, setSelectedObjects] = useState<string[]>([]);
  const [selectedObject, setSelectedObject] = useState<S3Object | null>(null);
  const [useEnhancedView, setUseEnhancedView] = useState(true);

  const handleToggleSelection = (objectKey: string) => {
    setSelectedObjects(prev => 
      prev.includes(objectKey)
        ? prev.filter(key => key !== objectKey)
        : [...prev, objectKey]
    );
  };

  const handleObjectDetail = (object: S3Object) => {
    setSelectedObject(object);
  };

  const handleCloseDetail = () => {
    setSelectedObject(null);
  };

  return (
    <div className="space-y-4">
      {/* 视图切换 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">对象管理</h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUseEnhancedView(!useEnhancedView)}
          className="flex items-center gap-2"
        >
          {useEnhancedView ? (
            <>
              <ToggleRight className="w-4 h-4 text-green-500" />
              增强版本视图
            </>
          ) : (
            <>
              <ToggleLeft className="w-4 h-4 text-gray-400" />
              标准视图
            </>
          )}
        </Button>
      </div>

      {/* 批量操作 */}
      {selectedObjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              已选择 {selectedObjects.length} 个对象
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  selectedObjects.forEach(key => onDownload(key));
                  setSelectedObjects([]);
                }}
              >
                批量下载
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  if (confirm(`确定要删除 ${selectedObjects.length} 个对象吗？`)) {
                    selectedObjects.forEach(key => onDelete(key));
                    setSelectedObjects([]);
                  }
                }}
              >
                批量删除
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 对象列表 */}
      {useEnhancedView ? (
        <EnhancedObjectsList
          objects={objects}
          bucketId={bucketId}
          bucketName={bucketName}
          selectedObjects={selectedObjects}
          onToggleSelection={handleToggleSelection}
          onFolderClick={onFolderClick}
          onDownload={onDownload}
          onDelete={onDelete}
          onDetail={handleObjectDetail}
          showVersionDetails={true}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          标准视图组件...
        </div>
      )}

      {/* 对象详情模态框 */}
      <ObjectDetailModal
        object={selectedObject}
        bucketId={bucketId}
        bucketName={bucketName}
        isOpen={!!selectedObject}
        onClose={handleCloseDetail}
        onDownload={onDownload}
        onDelete={(key: string) => {
          onDelete(key);
          handleCloseDetail();
        }}
      />
    </div>
  );
};

export default ObjectsPageExample;
