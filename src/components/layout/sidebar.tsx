"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Server, 
  FolderOpen, 
  Key, 
  LogOut 
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import Button from "@/components/ui/button";

const navigation = [
  { name: "仪表板", href: "/", icon: LayoutDashboard },
  { name: "集群管理", href: "/cluster", icon: Server },
  { name: "存储桶", href: "/buckets", icon: FolderOpen },
  { name: "访问密钥", href: "/keys", icon: Key },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Garage UI
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.username || "用户"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              管理员
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          登出
        </Button>
      </div>
    </div>
  );
}
