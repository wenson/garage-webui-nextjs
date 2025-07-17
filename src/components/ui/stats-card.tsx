import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number | undefined;
  icon: LucideIcon;
  valueClassName?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  valueClassName,
  className,
}: StatsCardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={cn(
            "text-2xl font-bold text-gray-900 dark:text-white mt-1",
            valueClassName
          )}>
            {value ?? "—"}
          </p>
        </div>
        <div className="ml-4">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
