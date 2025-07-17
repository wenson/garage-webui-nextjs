import { GarageAPIClientV2 } from '@/lib/garage-api-v2';
import { 
  GetClusterHealthResponse,
  GetBucketInfoResponse,
  ListBucketsResponse,
  GetKeyInfoResponse,
  ListKeysResponse,
  GetClusterStatusResponse
} from '@/types/garage-api-v2';

/**
 * Garage API v2 客户端
 * 直接使用 v2 API
 */
export class GarageAPI {
  constructor(private v2Client: GarageAPIClientV2) {}

  async getHealth(): Promise<GetClusterHealthResponse> {
    return this.v2Client.getClusterHealth();
  }

  async getClusterStatus(): Promise<GetClusterStatusResponse> {
    return this.v2Client.getClusterStatus();
  }

  async listBuckets(): Promise<ListBucketsResponse> {
    return this.v2Client.listBuckets();
  }

  async getBucket(id: string): Promise<GetBucketInfoResponse> {
    return this.v2Client.getBucketInfo({ id });
  }

  async listKeys(): Promise<ListKeysResponse> {
    return this.v2Client.listKeys();
  }

  async getKey(id: string): Promise<GetKeyInfoResponse> {
    return this.v2Client.getKeyInfo({ id });
  }

  // 获取原始 v2 客户端实例
  getV2Client(): GarageAPIClientV2 {
    return this.v2Client;
  }
}

// 创建全局实例
import { garageAPIv2 } from '@/lib/garage-api-v2';

export const garageAPI = new GarageAPI(garageAPIv2);
