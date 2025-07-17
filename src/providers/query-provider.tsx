"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { APIError } from '@/lib/garage-api-v2';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * 格式化错误信息为用户友好的消息
 */
function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 检查是否是APIError
    const apiError = error as APIError;
    if (apiError.status) {
      switch (apiError.status) {
        case 401:
        case 403:
          return '认证失败，请检查管理员令牌';
        case 404:
          return '请求的资源不存在';
        case 500:
          return '服务器内部错误';
        case 503:
          return '服务暂时不可用';
        default:
          return error.message;
      }
    }
    return error.message;
  }
  return '未知错误';
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5分钟
            gcTime: 1000 * 60 * 10, // 10分钟
            retry: (failureCount, error) => {
              // 认证错误不重试
              if (error.message.includes('401') || error.message.includes('403') || 
                  error.message.includes('访问被拒绝')) {
                return false;
              }
              // 集群配置问题不重试
              if (error.message.includes('Could not reach quorum') || 
                  error.message.includes('集群不可用')) {
                return false;
              }
              return failureCount < 3;
            },
          },
          mutations: {
            onError: (error) => {
              const message = formatErrorMessage(error);
              toast.error(message);
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
