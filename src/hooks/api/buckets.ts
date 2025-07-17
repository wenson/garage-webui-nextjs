import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { GarageCreateBucketRequest } from '@/types';

// 获取所有存储桶
export function useBuckets() {
  return useQuery({
    queryKey: ['buckets'],
    queryFn: () => apiClient.getBuckets(),
  });
}

// 获取单个存储桶详情
export function useBucket(bucketId: string) {
  return useQuery({
    queryKey: ['buckets', bucketId],
    queryFn: () => apiClient.getBucket(bucketId),
    enabled: !!bucketId,
  });
}

// 创建存储桶
export function useCreateBucket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: GarageCreateBucketRequest) => apiClient.createBucket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

// 删除存储桶
export function useDeleteBucket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bucketId: string) => apiClient.deleteBucket(bucketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
    },
  });
}

// 更新存储桶配置
export function useUpdateBucket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ bucketId, config }: { bucketId: string; config: object }) => 
      apiClient.updateBucket(bucketId, config),
    onSuccess: (_, { bucketId }) => {
      queryClient.invalidateQueries({ queryKey: ['buckets'] });
      queryClient.invalidateQueries({ queryKey: ['buckets', bucketId] });
    },
  });
}
