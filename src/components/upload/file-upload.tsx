"use client";

import { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  File, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  objectKey?: string;
}

interface FileUploadProps {
  bucketId: string;
  bucketName: string;
  currentPrefix: string;
  onUploadComplete?: () => void;
  onClose?: () => void;
  // 可选的上传密钥
  uploadCredentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export default function FileUploadComponent({
  bucketId,
  bucketName,
  currentPrefix = '',
  onUploadComplete,
  onClose,
  uploadCredentials,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (fileList: File[]) => {
    const newFiles = fileList.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const,
      objectKey: currentPrefix + file.name,
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (uploadFile: UploadFile, index: number) => {
    // 更新状态为上传中
    setFiles(prev => prev.map((f, i) => 
      i === index ? { ...f, status: 'uploading', progress: 0 } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('objectKey', uploadFile.objectKey || uploadFile.file.name);
      formData.append('bucketName', bucketName);
      
      // 如果提供了上传凭据，添加到表单数据中
      if (uploadCredentials) {
        formData.append('accessKeyId', uploadCredentials.accessKeyId);
        formData.append('secretAccessKey', uploadCredentials.secretAccessKey);
      }

      // 使用 XMLHttpRequest 获取真实上传进度
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        console.log(`开始上传文件: ${uploadFile.file.name}, 大小: ${uploadFile.file.size} bytes`);
        
        // 监听上传进度
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            console.log(`上传进度: ${progress}% (${event.loaded}/${event.total})`);
            setFiles(prev => prev.map((f, i) => 
              i === index ? { ...f, progress } : f
            ));
          }
        });

        // 监听上传完成
        xhr.addEventListener('load', () => {
          console.log(`上传完成, 状态码: ${xhr.status}`);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('服务器返回错误:', errorData);
              reject(new Error(errorData.error || `上传失败: ${xhr.status}`));
            } catch {
              console.error('解析错误响应失败:', xhr.responseText);
              reject(new Error(`上传失败: ${xhr.status} ${xhr.statusText}`));
            }
          }
        });

        // 监听错误
        xhr.addEventListener('error', () => {
          console.error('网络错误');
          reject(new Error('网络错误'));
        });

        // 监听超时
        xhr.addEventListener('timeout', () => {
          console.error('上传超时');
          reject(new Error('上传超时'));
        });

        // 设置超时时间 (10分钟，与服务器端一致)
        xhr.timeout = 10 * 60 * 1000;

        // 发送请求
        xhr.open('POST', `/api/garage/bucket/${bucketId}/upload`);
        xhr.send(formData);
      });

      await uploadPromise;

      // 上传成功
      setFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'success', progress: 100 } : f
      ));
      toast.success(`文件 ${uploadFile.file.name} 上传成功`);

    } catch (error) {
      setFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'error', 
          progress: 0,
          error: error instanceof Error ? error.message : '上传失败'
        } : f
      ));
      toast.error(`文件 ${uploadFile.file.name} 上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const uploadAllFiles = async () => {
    for (let i = 0; i < files.length; i++) {
      if (files[i].status === 'pending') {
        await uploadFile(files[i], i);
      }
    }

    // 检查是否所有文件都上传成功
    const allSuccess = files.every(f => f.status === 'success');
    if (allSuccess && onUploadComplete) {
      onUploadComplete();
    }
  };

  const retryUpload = (index: number) => {
    const file = files[index];
    if (file) {
      uploadFile(file, index);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>上传文件到 {bucketName}</CardTitle>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 拖拽上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
              : 'border-gray-300 dark:border-gray-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">拖拽文件到这里上传</p>
          <p className="text-sm text-gray-500 mb-4">或者点击选择文件</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            选择文件
          </Button>
        </div>

        {/* 上传路径 */}
        {currentPrefix && (
          <div className="text-sm text-gray-600">
            <Label>上传路径:</Label>
            <div className="mt-1 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {currentPrefix}
            </div>
          </div>
        )}

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>待上传文件</Label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {files.map((uploadFile, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(uploadFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatBytes(uploadFile.file.size)}
                      </p>
                      {uploadFile.error && (
                        <p className="text-xs text-red-500">{uploadFile.error}</p>
                      )}
                    </div>
                    {uploadFile.status === 'uploading' && (
                      <div className="w-24">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadFile.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-center mt-1">{uploadFile.progress}%</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadFile.status === 'error' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => retryUpload(index)}
                      >
                        重试
                      </Button>
                    )}
                    {uploadFile.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 上传按钮 */}
        {files.length > 0 && (
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setFiles([])}
              disabled={files.some(f => f.status === 'uploading')}
            >
              清空列表
            </Button>
            <Button
              onClick={uploadAllFiles}
              disabled={
                files.length === 0 || 
                files.every(f => f.status === 'success') ||
                files.some(f => f.status === 'uploading')
              }
            >
              <Upload className="h-4 w-4 mr-2" />
              开始上传
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
