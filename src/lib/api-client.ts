import { 
  GarageHealthResponse,
  GarageClusterStatus,
  GarageClusterLayout,
  GarageNode,
  GarageBucket,
  GarageBucketInfo,
  GarageCreateBucketRequest,
  GarageKey,
  GarageKeyInfo,
  GarageCreateKeyRequest,
  GarageKeyPermissions,
} from "@/types";
import { garageAPIv2 } from '@/lib/garage-api-v2';

export class APIClient {
  constructor() {
    // 不再需要 baseURL，因为我们使用 garageAPIv2 客户端
  }

  // 健康检查
  async getHealth(): Promise<GarageHealthResponse> {
    const health = await garageAPIv2.getClusterHealth();
    return health as unknown as GarageHealthResponse;
  }

  // 获取集群状态
  async getClusterStatus(): Promise<GarageClusterStatus> {
    const status = await garageAPIv2.getClusterStatus();
    return status as unknown as GarageClusterStatus;
  }

  // 获取集群布局
  async getClusterLayout(): Promise<GarageClusterLayout> {
    const layout = await garageAPIv2.getClusterLayout();
    return layout as unknown as GarageClusterLayout;
  }

  // 获取节点列表
  async getNodes(): Promise<GarageNode[]> {
    const status = await garageAPIv2.getClusterStatus();
    return (status as unknown as { nodes?: GarageNode[] }).nodes || [];
  }

  // 获取存储桶列表
  async getBuckets(): Promise<GarageBucket[]> {
    const buckets = await garageAPIv2.listBuckets();
    return buckets as unknown as GarageBucket[];
  }

  // 获取存储桶信息
  async getBucket(id: string): Promise<GarageBucketInfo> {
    const bucket = await garageAPIv2.getBucketInfo({ id });
    return bucket as unknown as GarageBucketInfo;
  }

  // 创建存储桶
  async createBucket(data: GarageCreateBucketRequest): Promise<GarageBucketInfo> {
    const bucket = await garageAPIv2.createBucket({
      globalAlias: data.globalAlias,
      localAlias: data.localAlias ? {
        accessKeyId: data.localAlias.keyId,
        alias: data.localAlias.alias
      } : null
    });
    return bucket as unknown as GarageBucketInfo;
  }

  // 删除存储桶
  async deleteBucket(id: string): Promise<void> {
    await garageAPIv2.deleteBucket(id);
  }

  // 更新存储桶配置
  async updateBucket(id: string, config: object): Promise<GarageBucketInfo> {
    const bucket = await garageAPIv2.updateBucket(id, config);
    return bucket as unknown as GarageBucketInfo;
  }

  // 获取访问密钥列表
  async getKeys(): Promise<GarageKey[]> {
    const keys = await garageAPIv2.listKeys();
    return keys as unknown as GarageKey[];
  }

  // 获取访问密钥信息
  async getKey(id: string): Promise<GarageKeyInfo> {
    const key = await garageAPIv2.getKeyInfo({ id });
    return key as unknown as GarageKeyInfo;
  }

  // 创建访问密钥
  async createKey(data: GarageCreateKeyRequest): Promise<GarageKeyInfo> {
    const key = await garageAPIv2.createKey({
      name: data.name
    });
    return key as unknown as GarageKeyInfo;
  }

  // 删除访问密钥
  async deleteKey(id: string): Promise<void> {
    await garageAPIv2.deleteKey(id);
  }

  // 更新访问密钥权限
  async updateKeyPermissions(
    id: string,
    permissions: GarageKeyPermissions
  ): Promise<GarageKeyInfo> {
    const key = await garageAPIv2.updateKey(id, { allow: permissions });
    return key as unknown as GarageKeyInfo;
  }

  // 更新集群布局
  async updateClusterLayout(data: {
    id: string;
    zone: string;
    capacity?: number;
    tags?: Record<string, string>;
  }): Promise<GarageClusterLayout> {
    // 将 tags 对象转换为字符串数组
    const tagArray = data.tags ? Object.entries(data.tags).map(([k, v]) => `${k}=${v}`) : [];
    
    // 使用 v2 API 客户端
    const layout = await garageAPIv2.updateClusterLayout({
      roles: [{
        id: data.id,
        change: {
          zone: data.zone,
          capacity: data.capacity || null,
          tags: tagArray
        }
      }]
    });
    return layout as unknown as GarageClusterLayout;
  }

  // 应用集群布局
  async applyClusterLayout(data: { version: number }): Promise<void> {
    // 使用 v2 API 客户端
    await garageAPIv2.applyClusterLayout({
      version: data.version
    });
  }
}

export const apiClient = new APIClient();
