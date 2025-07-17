'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Globe } from 'lucide-react';

interface WebsiteConfigData {
  websiteAccess: boolean;
  indexDocument: string;
  errorDocument: string;
}

interface WebsiteConfigCardProps {
  formData: WebsiteConfigData;
  isEditing: boolean;
  onFormDataChange: (data: Partial<WebsiteConfigData>) => void;
}

export function WebsiteConfigCard({ 
  formData, 
  isEditing, 
  onFormDataChange 
}: WebsiteConfigCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Globe className="h-5 w-5 mr-2" />
          网站配置
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="websiteAccess"
              checked={formData.websiteAccess}
              onChange={(e) => onFormDataChange({ websiteAccess: e.target.checked })}
              disabled={!isEditing}
              className="rounded"
            />
            <label htmlFor="websiteAccess" className="text-sm font-medium">
              启用静态网站托管
            </label>
          </div>

          {formData.websiteAccess && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium mb-2">索引文档</label>
                <Input
                  placeholder="index.html"
                  value={formData.indexDocument}
                  onChange={(e) => onFormDataChange({ indexDocument: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">错误文档</label>
                <Input
                  placeholder="error.html"
                  value={formData.errorDocument}
                  onChange={(e) => onFormDataChange({ errorDocument: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
