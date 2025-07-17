import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GarageCreateKeyRequest } from '@/types';

// 获取所有访问密钥
export function useKeys() {
  return useQuery({
    queryKey: ['keys'],
    queryFn: () => apiClient.getKeys(),
    staleTime: 0, // 数据立即过期，确保总是重新获取
    refetchOnWindowFocus: true, // 窗口获得焦点时重新获取
  });
}

// 获取单个访问密钥详情
export function useKey(keyId: string) {
  return useQuery({
    queryKey: ['keys', keyId],
    queryFn: () => apiClient.getKey(keyId),
    enabled: !!keyId,
  });
}

// 创建访问密钥
export function useCreateKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GarageCreateKeyRequest) => apiClient.createKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });
}

// 删除访问密钥
export function useDeleteKey() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (keyId: string) => apiClient.deleteKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
    },
  });
}

// 更新访问密钥权限
export function useUpdateKeyPermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ keyId, permissions }: { keyId: string; permissions: object }) => 
      apiClient.updateKeyPermissions(keyId, permissions),
    onSuccess: (_, { keyId }) => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      queryClient.invalidateQueries({ queryKey: ['keys', keyId] });
    },
  });
}
