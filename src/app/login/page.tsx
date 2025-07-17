"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  
  const from = searchParams.get("from") || "/";
  
  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace(from);
    }
  }, [user, router, from]);
  
  if (user?.isAuthenticated) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Garage Web UI
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            请登录以管理您的对象存储服务
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
