"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Server } from "lucide-react";

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline' | 'error';
  message?: string;
}

export default function EnvironmentStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Garage Admin API',
      url: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3903',
      status: 'checking'
    },
    {
      name: 'Garage S3 API',
      url: process.env.NEXT_PUBLIC_S3_ENDPOINT_URL || 'http://localhost:3900',
      status: 'checking'
    }
  ]);

  const checkService = async (service: ServiceStatus): Promise<ServiceStatus> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

      // 检查是否是 Garage Admin API，如果是则使用我们的 API 路由
      const endpoint = service.name === 'Garage Admin API' ? '/health' : '/health';
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      // 为 Admin API 添加认证头
      if (service.name === 'Garage Admin API') {
        const adminKey = process.env.NEXT_PUBLIC_API_ADMIN_KEY;
        if (adminKey) {
          headers['Authorization'] = `Bearer ${adminKey}`;
        }
      }

      const response = await fetch(`${service.url}${endpoint}`, {
        method: 'GET',
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          ...service,
          status: 'online',
          message: `服务运行正常 (${response.status})`
        };
      } else {
        return {
          ...service,
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          ...service,
          status: 'offline',
          message: '连接超时'
        };
      }
      
      return {
        ...service,
        status: 'offline',
        message: error instanceof Error ? error.message : '连接失败'
      };
    }
  };

  const checkAllServices = async () => {
    setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
    
    const results = await Promise.all(
      services.map(service => checkService(service))
    );
    
    setServices(results);
  };

  useEffect(() => {
    const initialCheck = async () => {
      setServices(prev => prev.map(s => ({ ...s, status: 'checking' })));
      
      const results = await Promise.all(
        services.map(service => checkService(service))
      );
      
      setServices(results);
    };
    
    initialCheck();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">检查中...</Badge>;
      case 'online':
        return <Badge variant="default" className="bg-green-100 text-green-800">在线</Badge>;
      case 'offline':
        return <Badge variant="destructive">离线</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const hasOfflineServices = services.some(s => s.status === 'offline' || s.status === 'error');

  return (
    <Card className={hasOfflineServices ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            环境服务状态
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={checkAllServices}>
            <RefreshCw className="h-4 w-4 mr-1" />
            刷新
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {hasOfflineServices && (
          <div className="mb-4 p-3 bg-orange-100 dark:bg-orange-900 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  检测到服务不可用
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  应用将使用模拟数据运行。请检查 Garage 服务是否正在运行。
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">{service.url}</p>
                  {service.message && (
                    <p className="text-xs text-gray-400">{service.message}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(service.status)}
            </div>
          ))}
        </div>

        {hasOfflineServices && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              快速解决方案：
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 确保 Garage 服务正在运行</li>
              <li>• 检查 .env.local 中的 API 地址配置</li>
              <li>• 验证防火墙和网络设置</li>
              <li>• 当前应用使用模拟数据，功能演示不受影响</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
