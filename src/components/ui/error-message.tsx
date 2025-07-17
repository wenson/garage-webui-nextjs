import { AlertTriangle, RefreshCw, Settings } from "lucide-react";
import { Card, CardContent } from "./card";
import Button from "./button";

// 解析原始错误信息的函数
function parseRawError(error: unknown): { 
  message: string; 
  originalMessage: string;
  statusCode?: number;
} {
  let message: string;
  let originalMessage: string;
  let statusCode: number | undefined;

  // 直接获取原始错误信息，不做任何转换
  if (typeof error === 'string') {
    originalMessage = error;
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    originalMessage = String((error as { message: unknown }).message);
    message = originalMessage;

    // 获取状态码信息（如果有）
    if ('status' in error) {
      statusCode = (error as { status: number }).status;
    }
  } else if (error && typeof error === 'object') {
    // 尝试 JSON 序列化整个错误对象
    try {
      originalMessage = JSON.stringify(error, null, 2);
      message = originalMessage;
    } catch {
      originalMessage = String(error);
      message = originalMessage;
    }
  } else {
    originalMessage = '未知错误';
    message = originalMessage;
  }

  return { message, originalMessage, statusCode };
}

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  showConfigHint?: boolean;
  error?: unknown; // 原始错误对象，用于更详细的解析
}

export function ErrorMessage({ 
  title = "发生错误", 
  message, 
  type = 'error',
  onRetry,
  showConfigHint = false,
  error
}: ErrorMessageProps) {
  // 解析原始错误信息
  const errorInfo = error ? parseRawError(error) : { 
    message, 
    originalMessage: message
  };

  const displayMessage = errorInfo.message || message;

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'info':
        return <Settings className="h-8 w-8 text-blue-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      case 'info':
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    }
  };

  // 检查是否是集群配置问题（基于HTTP状态码503或特定关键词）
  const isClusterIssue = errorInfo.statusCode === 503 || 
                         displayMessage.includes('Service Unavailable') ||
                         displayMessage.includes('Could not reach quorum') ||
                         displayMessage.includes('ServiceUnavailable');

  return (
    <Card className={`${getBackgroundColor()} border-2`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {getIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            
            {/* 显示原始错误信息 */}
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {displayMessage}
              </p>
              
              {/* 显示HTTP状态码（如果有） */}
              {errorInfo.statusCode && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-xs mr-2">
                    HTTP {errorInfo.statusCode}
                  </span>
                  <span>状态码</span>
                </div>
              )}
            </div>
            
            {isClusterIssue && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  可能的解决方案
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  HTTP 503 错误通常表示服务不可用。如果这是Garage集群，可能需要配置集群节点：
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-decimal">
                  <li>检查Garage服务是否正常运行</li>
                  <li>为集群节点分配角色（gateway、storage等）</li>
                  <li>配置集群布局（节点权重、区域分布）</li>
                  <li>应用布局变更</li>
                </ol>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  variant="secondary"
                  size="sm"
                  className="flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重试
                </Button>
              )}
              
              {showConfigHint && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center"
                  onClick={() => window.open('https://garagehq.deuxfleurs.fr/documentation/', '_blank')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  查看配置文档
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
