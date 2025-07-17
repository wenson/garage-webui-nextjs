import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 配置环境变量
  env: {
    GARAGE_API_BASE_URL: process.env.GARAGE_API_BASE_URL,
    GARAGE_API_ADMIN_KEY: process.env.GARAGE_API_ADMIN_KEY,
  },
  
  // 实验性功能
  experimental: {
    // 优化包导入
    optimizePackageImports: ['lucide-react'],
  }
};

export default nextConfig;
