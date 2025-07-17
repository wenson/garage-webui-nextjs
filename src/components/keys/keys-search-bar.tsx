'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface KeysSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
}

export function KeysSearchBar({ 
  searchTerm, 
  onSearchChange, 
  totalCount 
}: KeysSearchBarProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="搜索访问密钥..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="text-sm text-gray-500">
        共 {totalCount} 个密钥
      </div>
    </div>
  );
}
