'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from '@/components/ui/error-message';
import { Settings, RefreshCw } from 'lucide-react';

interface NodeConfig {
  id: string;
  zone: string;
  capacity: number;
  tags: Record<string, string>;
}

interface CapacityConfig {
  value: number;
  unit: 'MB' | 'GB';
}

interface NodeConfigFormProps {
  nodeConfig: NodeConfig;
  capacityConfig: CapacityConfig;
  isUpdating: boolean;
  error?: Error | null;
  onNodeConfigChange: (config: Partial<NodeConfig>) => void;
  onCapacityChange: (value: number, unit: 'MB' | 'GB') => void;
  onConfigureNode: () => void;
}

export function NodeConfigForm({
  nodeConfig,
  capacityConfig,
  isUpdating,
  error,
  onNodeConfigChange,
  onCapacityChange,
  onConfigureNode
}: NodeConfigFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          节点存储配置
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nodeId">节点ID</Label>
          <Input
            id="nodeId"
            value={nodeConfig.id}
            onChange={(e) => onNodeConfigChange({ id: e.target.value })}
            placeholder="选择或输入节点ID"
            className="font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="zone">存储区域</Label>
          <Input
            id="zone"
            value={nodeConfig.zone}
            onChange={(e) => onNodeConfigChange({ zone: e.target.value })}
            placeholder="例如: dc1, zone-a"
          />
        </div>

        <div>
          <Label htmlFor="capacity">存储容量</Label>
          <div className="flex space-x-2">
            <Input
              id="capacity"
              type="number"
              value={capacityConfig.value}
              onChange={(e) => onCapacityChange(parseFloat(e.target.value) || 0, capacityConfig.unit)}
              placeholder="例如: 100"
              className="flex-1"
              min="0"
              step="0.1"
            />
            <select
              value={capacityConfig.unit}
              onChange={(e) => onCapacityChange(capacityConfig.value, e.target.value as 'MB' | 'GB')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MB">MB</option>
              <option value="GB">GB</option>
            </select>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            总计: {(nodeConfig.capacity / 1024 / 1024 / 1024).toFixed(3)} GB ({nodeConfig.capacity.toLocaleString()} 字节)
          </p>
        </div>

        <Button
          onClick={onConfigureNode}
          disabled={!nodeConfig.id || isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              配置中...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              分配存储角色
            </>
          )}
        </Button>

        {error && (
          <ErrorMessage 
            error={error} 
            message={error.message || '配置节点失败'} 
          />
        )}
      </CardContent>
    </Card>
  );
}
