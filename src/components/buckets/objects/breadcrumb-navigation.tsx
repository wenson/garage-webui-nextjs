"use client";

import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/button";
import { FolderOpen, ChevronRight } from "lucide-react";

interface BreadcrumbNavigationProps {
  currentPrefix: string;
  onBreadcrumbClick: (index: number) => void;
  onRootClick: () => void;
}

export function BreadcrumbNavigation({
  currentPrefix,
  onBreadcrumbClick,
  onRootClick
}: BreadcrumbNavigationProps) {
  if (!currentPrefix) return null;

  const pathParts = currentPrefix.split('/').filter(Boolean);

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-center space-x-2 text-sm">
          <FolderOpen className="h-4 w-4" />
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-normal"
            onClick={onRootClick}
          >
            根目录
          </Button>
          {pathParts.map((part, index) => (
            <div key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-3 w-3 text-gray-400" />
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 font-normal"
                onClick={() => onBreadcrumbClick(index)}
              >
                {part}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
