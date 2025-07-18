"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Key, ArrowLeft, Shield, Bug } from 'lucide-react';
import RootKeyStatus from '@/components/keys/root-key-status';
import CreateRootKeyForm from '@/components/keys/create-root-key-form';
import RootKeyDebug from '@/components/keys/root-key-debug';
import { useRouter } from 'next/navigation';

export default function RootKeyManagementPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'status' | 'create' | 'debug'>('status');

  const handleKeyConfigured = () => {
    setActiveView('status');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/keys')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回密钥管理
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Root Key 管理
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              创建和管理具有全局权限的 Root Key
            </p>
          </div>
        </div>
      </div>

      {/* 导航标签 */}
      <div className="flex items-center space-x-2">
        <Button
          variant={activeView === 'status' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('status')}
        >
          <Shield className="h-4 w-4 mr-2" />
          状态检查
        </Button>
        <Button
          variant={activeView === 'create' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('create')}
        >
          <Key className="h-4 w-4 mr-2" />
          创建新 Key
        </Button>
        <Button
          variant={activeView === 'debug' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('debug')}
        >
          <Bug className="h-4 w-4 mr-2" />
          权限诊断
        </Button>
      </div>

      {/* 内容区域 */}
      <div>
        {activeView === 'status' && (
          <RootKeyStatus onKeyConfigured={handleKeyConfigured} />
        )}
        
        {activeView === 'create' && (
          <CreateRootKeyForm
            onKeyCreated={handleKeyConfigured}
            onClose={() => setActiveView('status')}
          />
        )}

        {activeView === 'debug' && (
          <RootKeyDebug />
        )}
      </div>

      {/* 帮助信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Root Key 使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">创建流程</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>1. 使用 Admin Token 调用 CreateKey API</li>
                <li>2. 设置 createBucket 权限和永不过期</li>
                <li>3. 获取所有现有桶列表</li>
                <li>4. 为每个桶调用 AllowBucketKey 授权</li>
                <li>5. 生成访问密钥 ID 和密钥</li>
                <li>6. 配置到环境变量中使用</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">权限说明</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 创建新存储桶的权限</li>
                <li>• 读取所有现有存储桶和对象</li>
                <li>• 写入和删除对象</li>
                <li>• 管理存储桶（owner 权限）</li>
                <li>• 文件上传和下载操作</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>安全提醒：</strong>
              Root Key 具有最高权限，请妥善保管。建议定期轮换密钥，并且只在必要时使用。
              不要在代码中硬编码密钥信息，应该通过环境变量或安全存储系统管理。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
