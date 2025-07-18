import React, { useState } from 'react';
import Button from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, FolderPlus } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
  currentPrefix: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  currentPrefix
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!folderName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateFolder(folderName.trim());
      setFolderName('');
      onClose();
    } catch (error) {
      console.error('创建文件夹失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            新建文件夹
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              文件夹名称
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入文件夹名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isCreating}
            />
            {currentPrefix && (
              <p className="text-sm text-gray-500 mt-1">
                将在 <span className="font-mono">{currentPrefix}</span> 下创建
              </p>
            )}
          </div>

          {/* Preview */}
          {folderName.trim() && (
            <div className="p-3 bg-gray-50 rounded border">
              <p className="text-sm text-gray-600">完整路径:</p>
              <p className="text-sm font-mono text-gray-800">
                {currentPrefix}{folderName.trim()}/
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isCreating}
          >
            取消
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!folderName.trim() || isCreating}
            loading={isCreating}
          >
            {isCreating ? '创建中...' : '创建文件夹'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateFolderModal;
