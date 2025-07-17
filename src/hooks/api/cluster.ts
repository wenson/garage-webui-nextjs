import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useClusterStatus() {
  return useQuery({
    queryKey: ['cluster', 'status'],
    queryFn: () => apiClient.getClusterStatus(),
    refetchInterval: 30000, // 30秒自动刷新
  });
}

export function useClusterLayout() {
  return useQuery({
    queryKey: ['cluster', 'layout'],
    queryFn: () => apiClient.getClusterLayout(),
    refetchInterval: 60000, // 1分钟自动刷新
  });
}

export function useNodes() {
  return useQuery({
    queryKey: ['cluster', 'nodes'],
    queryFn: () => apiClient.getNodes(),
    refetchInterval: 30000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 10000, // 10秒检查健康状态
    retry: 1,
  });
}

export function useUpdateClusterLayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      id: string;
      zone: string;
      capacity?: number;
      tags?: Record<string, string>;
    }) => apiClient.updateClusterLayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster'] });
    },
  });
}

export function useApplyClusterLayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { version: number }) => apiClient.applyClusterLayout(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cluster'] });
      queryClient.invalidateQueries({ queryKey: ['health'] });
    },
  });
}
