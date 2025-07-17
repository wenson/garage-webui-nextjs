'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BucketsSearchBarProps {
  searchTerm: string;
  totalCount: number;
  onSearchChange: (term: string) => void;
}

export function BucketsSearchBar({ searchTerm, totalCount, onSearchChange }: BucketsSearchBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索存储桶..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="text-sm text-gray-500">
        共 {totalCount} 个存储桶
      </div>
    </div>
  );
}
