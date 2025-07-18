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
  error?: string;
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
  const params = new URLSearchParams();
  params.set('objectKey', objectKey);
  if (bucketName) params.set('bucketName', bucketName);

  const response = await fetch(`/api/garage/bucket/${bucketId}/download?${params}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '下载失败');
  }

  // 获取文件名
  const contentDisposition = response.headers.get('content-disposition');
  let filename = objectKey.split('/').pop() || 'download';
  
  if (contentDisposition) {
    const matches = contentDisposition.match(/filename="([^"]*)"/) || 
                   contentDisposition.match(/filename=([^;]*)/);
    if (matches && matches[1]) {
      filename = matches[1];
    }
  }

  // 创建下载链接
  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  
  // 触发下载
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理 URL
  URL.revokeObjectURL(downloadUrl);
}

// 删除对象
export async function deleteObject(bucketId: string, objectKey: string, bucketName?: string) {
  const params = new URLSearchParams();
  params.set('objectKey', objectKey);
  if (bucketName) params.set('bucketName', bucketName);

  const response = await fetch(`/api/garage/bucket/${bucketId}/delete?${params}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '删除失败');
  }

  return response.json();
}

// 批量删除对象
export async function deleteObjects(bucketId: string, objectKeys: string[], bucketName?: string) {
  const deletePromises = objectKeys.map(objectKey => 
    deleteObject(bucketId, objectKey, bucketName)
  );
  
  await Promise.all(deletePromises);
}

// 创建文件夹 (通过上传一个空的占位符文件)
export async function createFolder(
  bucketId: string, 
  folderPath: string, 
  bucketName: string
): Promise<{success: boolean; error?: string}> {
  try {
    // 确保文件夹路径以 / 结尾
    const normalizedPath = folderPath.endsWith('/') ? folderPath : `${folderPath}/`;
    
    // 创建一个空文件作为文件夹占位符
    const placeholderKey = `${normalizedPath}.keep`;
    
    const formData = new FormData();
    formData.append('file', new Blob([''], { type: 'text/plain' }), '.keep');
    formData.append('objectKey', placeholderKey);
    formData.append('bucketName', bucketName);

    const response = await fetch(`/api/garage/bucket/${bucketId}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '创建文件夹失败');
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '创建文件夹失败' 
    };
  }
}

// 重命名/移动对象 (通过复制然后删除原文件实现)
export async function renameObject(
  bucketId: string, 
  oldKey: string, 
  newKey: string, 
  bucketName: string
): Promise<{success: boolean; error?: string}> {
  try {
    // 这里需要实现复制和删除操作
    // 由于Garage API可能不直接支持重命名，我们需要：
    // 1. 下载原文件
    // 2. 以新名称上传
    // 3. 删除原文件
    
    // 先获取原文件
    const downloadParams = new URLSearchParams();
    downloadParams.set('objectKey', oldKey);
    downloadParams.set('bucketName', bucketName);
    
    const downloadResponse = await fetch(`/api/garage/bucket/${bucketId}/download?${downloadParams}`);
    if (!downloadResponse.ok) {
      throw new Error('无法下载原文件');
    }
    
    const fileBlob = await downloadResponse.blob();
    
    // 上传到新位置
    const formData = new FormData();
    formData.append('file', fileBlob);
    formData.append('objectKey', newKey);
    formData.append('bucketName', bucketName);

    const uploadResponse = await fetch(`/api/garage/bucket/${bucketId}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || '上传失败');
    }

    // 删除原文件
    await deleteObject(bucketId, oldKey, bucketName);

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '重命名失败' 
    };
  }
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
