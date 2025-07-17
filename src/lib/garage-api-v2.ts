import { 
  GetClusterHealthResponse,
  GetClusterStatusResponse,
  GetClusterStatisticsResponse,
  ListBucketsResponse,
  GetBucketInfoResponse,
  CreateBucketRequest,
  UpdateBucketRequestBody,
  ListKeysResponse,
  GetKeyInfoResponse,
  CreateKeyRequest,
  UpdateKeyRequestBody,
  ImportKeyRequest,
  ListAdminTokensResponse,
  GetAdminTokenInfoResponse,
  CreateAdminTokenResponse,
  UpdateAdminTokenRequestBody,
  GetClusterLayoutResponse,
  UpdateClusterLayoutRequest,
  ApplyClusterLayoutRequest,
  ApplyClusterLayoutResponse,
  PreviewClusterLayoutChangesResponse,
  ConnectClusterNodesResponse,
  MultiResponse,
  LocalGetNodeInfoResponse,
  LocalGetNodeStatisticsResponse,
  InspectObjectResponse,
  CleanupIncompleteUploadsRequest,
  CleanupIncompleteUploadsResponse,
  AllowBucketKeyRequest,
  DenyBucketKeyRequest,
  AddBucketAliasRequest,
  RemoveBucketAliasRequest,
  GarageAdminAPIv2
} from '@/types/garage-api-v2';

// 扩展Error类型以包含HTTP状态信息
export interface APIError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
}

export class GarageAPIClientV2 implements GarageAdminAPIv2 {
  private baseURL: string;
  private adminToken: string;

  constructor(baseURL: string = '/api/garage', adminToken: string = '') {
    this.baseURL = baseURL.replace(/\/$/, '');
    this.adminToken = adminToken;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.adminToken) {
      headers['Authorization'] = `Bearer ${this.adminToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // 返回原始错误响应体，不做格式化
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          // 直接返回原始错误信息，不格式化
          if (errorData.code && errorData.message) {
            errorMessage = `${errorData.code}: ${errorData.message}`;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            // 如果有其他字段，返回整个JSON
            errorMessage = JSON.stringify(errorData);
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
      
      const error = new Error(errorMessage) as APIError;
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Some endpoints return empty responses
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as T;
    }
  }

  // Special endpoints (no authentication required)
  async health(): Promise<void> {
    await this.request<void>('/health');
  }

  async metrics(): Promise<string> {
    return this.request<string>('/metrics');
  }

  async checkDomain(domain: string): Promise<void> {
    await this.request<void>(`/check?domain=${encodeURIComponent(domain)}`);
  }

  // Cluster health and status
  async getClusterHealth(): Promise<GetClusterHealthResponse> {
    return this.request<GetClusterHealthResponse>('/v2/GetClusterHealth');
  }

  async getClusterStatus(): Promise<GetClusterStatusResponse> {
    return this.request<GetClusterStatusResponse>('/v2/GetClusterStatus');
  }

  async getClusterStatistics(): Promise<GetClusterStatisticsResponse> {
    return this.request<GetClusterStatisticsResponse>('/v2/GetClusterStatistics');
  }

  // Bucket management
  async listBuckets(): Promise<ListBucketsResponse> {
    return this.request<ListBucketsResponse>('/v2/ListBuckets');
  }

  async getBucketInfo(params: { 
    id?: string; 
    globalAlias?: string; 
    search?: string; 
  }): Promise<GetBucketInfoResponse> {
    const searchParams = new URLSearchParams();
    if (params.id) searchParams.set('id', params.id);
    if (params.globalAlias) searchParams.set('globalAlias', params.globalAlias);
    if (params.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    const endpoint = `/v2/GetBucketInfo${query ? `?${query}` : ''}`;
    return this.request<GetBucketInfoResponse>(endpoint);
  }

  async createBucket(request: CreateBucketRequest): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>('/v2/CreateBucket', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateBucket(id: string, request: UpdateBucketRequestBody): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>(`/v2/UpdateBucket?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteBucket(id: string): Promise<void> {
    await this.request<void>(`/v2/DeleteBucket?id=${encodeURIComponent(id)}`, {
      method: 'POST',
    });
  }

  // Bucket aliases
  async addBucketAlias(request: AddBucketAliasRequest): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>('/v2/AddBucketAlias', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async removeBucketAlias(request: RemoveBucketAliasRequest): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>('/v2/RemoveBucketAlias', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Access keys
  async listKeys(): Promise<ListKeysResponse> {
    return this.request<ListKeysResponse>('/v2/ListKeys');
  }

  async getKeyInfo(params: { 
    id?: string; 
    search?: string; 
    showSecretKey?: boolean; 
  }): Promise<GetKeyInfoResponse> {
    const searchParams = new URLSearchParams();
    if (params.id) searchParams.set('id', params.id);
    if (params.search) searchParams.set('search', params.search);
    if (params.showSecretKey) searchParams.set('showSecretKey', 'true');
    
    const query = searchParams.toString();
    const endpoint = `/v2/GetKeyInfo${query ? `?${query}` : ''}`;
    return this.request<GetKeyInfoResponse>(endpoint);
  }

  async createKey(request: CreateKeyRequest): Promise<GetKeyInfoResponse> {
    return this.request<GetKeyInfoResponse>('/v2/CreateKey', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateKey(id: string, request: UpdateKeyRequestBody): Promise<GetKeyInfoResponse> {
    return this.request<GetKeyInfoResponse>(`/v2/UpdateKey?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteKey(id: string): Promise<void> {
    await this.request<void>(`/v2/DeleteKey?id=${encodeURIComponent(id)}`, {
      method: 'POST',
    });
  }

  async importKey(request: ImportKeyRequest): Promise<GetKeyInfoResponse> {
    return this.request<GetKeyInfoResponse>('/v2/ImportKey', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Permissions
  async allowBucketKey(request: AllowBucketKeyRequest): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>('/v2/AllowBucketKey', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async denyBucketKey(request: DenyBucketKeyRequest): Promise<GetBucketInfoResponse> {
    return this.request<GetBucketInfoResponse>('/v2/DenyBucketKey', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Admin tokens
  async listAdminTokens(): Promise<ListAdminTokensResponse> {
    return this.request<ListAdminTokensResponse>('/v2/ListAdminTokens');
  }

  async getAdminTokenInfo(params: { 
    id?: string; 
    search?: string; 
  }): Promise<GetAdminTokenInfoResponse> {
    const searchParams = new URLSearchParams();
    if (params.id) searchParams.set('id', params.id);
    if (params.search) searchParams.set('search', params.search);
    
    const query = searchParams.toString();
    const endpoint = `/v2/GetAdminTokenInfo${query ? `?${query}` : ''}`;
    return this.request<GetAdminTokenInfoResponse>(endpoint);
  }

  async getCurrentAdminTokenInfo(): Promise<GetAdminTokenInfoResponse> {
    return this.request<GetAdminTokenInfoResponse>('/v2/GetCurrentAdminTokenInfo');
  }

  async createAdminToken(request: UpdateAdminTokenRequestBody): Promise<CreateAdminTokenResponse> {
    return this.request<CreateAdminTokenResponse>('/v2/CreateAdminToken', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateAdminToken(id: string, request: UpdateAdminTokenRequestBody): Promise<GetAdminTokenInfoResponse> {
    return this.request<GetAdminTokenInfoResponse>(`/v2/UpdateAdminToken?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteAdminToken(id: string): Promise<void> {
    await this.request<void>(`/v2/DeleteAdminToken?id=${encodeURIComponent(id)}`, {
      method: 'POST',
    });
  }

  // Cluster layout
  async getClusterLayout(): Promise<GetClusterLayoutResponse> {
    return this.request<GetClusterLayoutResponse>('/v2/GetClusterLayout');
  }

  async updateClusterLayout(request: UpdateClusterLayoutRequest): Promise<GetClusterLayoutResponse> {
    return this.request<GetClusterLayoutResponse>('/v2/UpdateClusterLayout', {
        method: 'POST',
        body: JSON.stringify(request),
    });
  }

  async applyClusterLayout(request: ApplyClusterLayoutRequest): Promise<ApplyClusterLayoutResponse> {
    return this.request<ApplyClusterLayoutResponse>('/v2/ApplyClusterLayout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async revertClusterLayout(): Promise<GetClusterLayoutResponse> {
    return this.request<GetClusterLayoutResponse>('/v2/RevertClusterLayout', {
      method: 'POST',
    });
  }

  async previewClusterLayoutChanges(): Promise<PreviewClusterLayoutChangesResponse> {
    return this.request<PreviewClusterLayoutChangesResponse>('/v2/PreviewClusterLayoutChanges', {
        method: 'POST',
    });
  }

  // Node management
  async connectClusterNodes(nodes: string[]): Promise<ConnectClusterNodesResponse> {
    return this.request<ConnectClusterNodesResponse>('/v2/ConnectClusterNodes', {
      method: 'POST',
      body: JSON.stringify(nodes),
    });
  }

  async getNodeInfo(node: string): Promise<MultiResponse<LocalGetNodeInfoResponse>> {
    return this.request<MultiResponse<LocalGetNodeInfoResponse>>(`/v2/GetNodeInfo/${encodeURIComponent(node)}`);
  }

  async getNodeStatistics(node: string): Promise<MultiResponse<LocalGetNodeStatisticsResponse>> {
    return this.request<MultiResponse<LocalGetNodeStatisticsResponse>>(`/v2/GetNodeStatistics/${encodeURIComponent(node)}`);
  }

  // Object inspection
  async inspectObject(params: { bucketId: string; key: string }): Promise<InspectObjectResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('bucketId', params.bucketId);
    searchParams.set('key', params.key);
    
    return this.request<InspectObjectResponse>(`/v2/InspectObject?${searchParams.toString()}`);
  }

  // Maintenance
  async cleanupIncompleteUploads(request: CleanupIncompleteUploadsRequest): Promise<CleanupIncompleteUploadsResponse> {
    return this.request<CleanupIncompleteUploadsResponse>('/v2/CleanupIncompleteUploads', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

// 创建单例实例
export const garageAPIv2 = new GarageAPIClientV2();

// 兼容性函数：检查是否支持 v2 API (已简化，总是返回true)
export async function checkV2APISupport(): Promise<boolean> {
  return true; // 我们现在只支持v2
}
