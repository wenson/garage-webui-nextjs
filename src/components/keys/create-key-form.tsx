'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Button from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateKeyFormProps {
  isVisible: boolean;
  keyName: string;
  isCreating: boolean;
  onKeyNameChange: (name: string) => void;
  onCreateKey: () => void;
  onCancel: () => void;
}

export function CreateKeyForm({
  isVisible,
  keyName,
  isCreating,
  onKeyNameChange,
  onCreateKey,
  onCancel
}: CreateKeyFormProps) {
  if (!isVisible) return null;

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCreateKey();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          创建新访问密钥
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              密钥名称 (可选)
            </label>
            <Input
              placeholder="输入密钥名称..."
              value={keyName}
              onChange={(e) => onKeyNameChange(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <p className="text-xs text-gray-500 mt-1">
              为密钥设置一个易于识别的名称
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={onCreateKey}
              disabled={isCreating}
            >
              {isCreating ? "创建中..." : "创建"}
            </Button>
            <Button
              variant="ghost"
              onClick={onCancel}
            >
              取消
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
