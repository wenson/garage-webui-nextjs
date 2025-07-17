import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

function Loading({ size = "md", className, text }: LoadingProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
            sizes[size]
          )}
        />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700",
        className
      )}
    />
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600",
        className
      )}
    />
  );
}

export { Loading, LoadingSkeleton, LoadingSpinner };
