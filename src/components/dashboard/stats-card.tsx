import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = "stable",
  className,
}: StatsCardProps) {
  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  };

  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    stable: "text-gray-400",
  };

  const TrendIcon = trendIcons[trend];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p className={cn(
                "text-2xl font-semibold text-gray-900 dark:text-white",
                className
              )}>
                {value}
              </p>
              {subtitle && (
                <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center space-y-1">
            <Icon className="h-8 w-8 text-gray-400" />
            <TrendIcon className={cn("h-4 w-4", trendColors[trend])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
