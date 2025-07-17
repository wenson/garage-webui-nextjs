"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const { verifyAuth } = useAuthStore();

  useEffect(() => {
    // 在应用启动时验证认证状态
    verifyAuth();
  }, [verifyAuth]);

  return <>{children}</>;
}
