import { useQuery } from '@tanstack/react-query';

// 定义对象类型
export interface S3Object {
  key: string;
  lastModified: string;
  etag: string;
  size: number;
  storageClass: string;
  isFolder?: boolean;
}

export interface ListObjectsResponse {
  objects: S3Object[];
  prefixes: string[];
  isTruncated: boolean;
  nextContinuationToken?: string;
}

// 获取存储桶对象列表
export function useBucketObjects(
  bucketId: string, 
  prefix: string = '',
  bucketName?: string
) {
  return useQuery({
    queryKey: ['bucket-objects', bucketId, prefix],
    queryFn: async (): Promise<ListObjectsResponse> => {
      const params = new URLSearchParams();
      if (prefix) params.set('prefix', prefix);
      if (bucketName) params.set('bucketName', bucketName);
      
      const response = await fetch(`/api/garage/bucket/${bucketId}/objects?${params}`);
      
      if (!response.ok) {
        throw new Error('获取对象列表失败');
      }
      
      return response.json();
    },
    enabled: !!bucketId,
  });
}

// 下载对象
export async function downloadObject(bucketId: string, objectKey: string, bucketName?: string) {
  // TODO: 实现实际的下载逻辑
  // 这里应该生成预签名URL或直接下载
  console.log('下载对象:', bucketId, objectKey, bucketName);
}

// 删除对象
export async function deleteObject(bucketId: string, objectKey: string, bucketName?: string) {
  // TODO: 实现实际的删除逻辑
  // 这里应该调用S3 API删除对象
  console.log('删除对象:', bucketId, objectKey, bucketName);
}

// 批量删除对象
export async function deleteObjects(bucketId: string, objectKeys: string[], bucketName?: string) {
  // TODO: 实现实际的批量删除逻辑
  console.log('批量删除对象:', bucketId, objectKeys, bucketName);
}
