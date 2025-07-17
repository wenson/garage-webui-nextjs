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
  // TODO: 实现删除对象的逻辑
  console.log('删除对象:', bucketId, objectKey, bucketName);
}

// 批量删除对象
export async function deleteObjects(bucketId: string, objectKeys: string[], bucketName?: string) {
  // TODO: 实现批量删除对象的逻辑
  console.log('批量删除对象:', bucketId, objectKeys, bucketName);
}

// 上传文件
export async function uploadFile(
  bucketId: string, 
  file: File, 
  objectKey: string, 
  bucketName: string,
  onProgress?: (progress: number) => void
): Promise<{success: boolean; error?: string}> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('objectKey', objectKey);
    formData.append('bucketName', bucketName);

    // 创建 XMLHttpRequest 以支持上传进度
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `上传失败: ${xhr.status}` });
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, error: '网络错误' });
      };

      xhr.open('POST', `/api/garage/bucket/${bucketId}/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '上传失败' 
    };
  }
}
