"use client";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Search, Trash2 } from "lucide-react";

interface ObjectsSearchAndActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedObjects: string[];
  onBatchDelete: () => void;
}

export function ObjectsSearchAndActions({
  searchTerm,
  onSearchChange,
  selectedObjects,
  onBatchDelete
}: ObjectsSearchAndActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索对象..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        {selectedObjects.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              已选择 {selectedObjects.length} 个对象
            </Badge>
            <Button
              variant="destructive"
              size="sm"
              onClick={onBatchDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              批量删除
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
