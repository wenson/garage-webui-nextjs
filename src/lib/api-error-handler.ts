import { NextResponse } from 'next/server';

/**
 * 处理Garage API响应的通用错误处理函数
 */
export async function handleGarageAPIResponse(response: Response, returnRaw: boolean = false): Promise<NextResponse> {
  // 如果要求返回原始响应
  if (returnRaw) {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { 
        status: response.status,
        headers: { 'Content-Type': contentType || 'text/plain' }
      });
    }
  }

  if (!response.ok) {
    let errorMessage = `Garage API error: ${response.status} ${response.statusText}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        // Garage API v2 错误格式
        if (errorData.code && errorData.message) {
          errorMessage = `${errorData.code}: ${errorData.message}`;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
    } catch (parseError) {
      // 如果解析错误响应失败，使用默认错误信息
      console.warn('Failed to parse error response:', parseError);
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        status: response.status,
        timestamp: new Date().toISOString()
      },
      { status: response.status }
    );
  }
  
  // 成功响应，返回JSON数据
  const data = await response.json();
  return NextResponse.json(data);
}
