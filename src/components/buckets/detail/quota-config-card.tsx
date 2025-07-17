'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HardDrive } from 'lucide-react';

interface QuotaConfigData {
  maxSize: string;
  maxObjects: string;
}

interface QuotaConfigCardProps {
  formData: QuotaConfigData;
  isEditing: boolean;
  onFormDataChange: (data: Partial<QuotaConfigData>) => void;
}

export function QuotaConfigCard({ 
  formData, 
  isEditing, 
  onFormDataChange 
}: QuotaConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HardDrive className="h-5 w-5 mr-2" />
          配额设置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">最大存储空间 (MB)</label>
            <Input
              type="number"
              placeholder="无限制"
              value={formData.maxSize}
              onChange={(e) => onFormDataChange({ maxSize: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">最大对象数量</label>
            <Input
              type="number"
              placeholder="无限制"
              value={formData.maxObjects}
              onChange={(e) => onFormDataChange({ maxObjects: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
