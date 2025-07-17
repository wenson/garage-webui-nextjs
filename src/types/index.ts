// Health status types
export interface NodesHealth {
  status: "healthy" | "degraded" | "unavailable";
  knownNodes: number;
  connectedNodes: number;
  storageNodes: number;
  storageNodesOk: number;
  partitions: number;
  partitionsQuorum: number;
  partitionsAllOk: number;
}

// Bucket types
export interface Bucket {
  id: string;
  globalAliases: string[];
  localAliases: string[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  quotas: {
    maxSize?: number;
    maxObjects?: number;
  };
  websiteConfig?: {
    indexDocument?: string;
    errorDocument?: string;
  };
}

// Cluster node types
export interface ClusterNode {
  id: string;
  hostname: string;
  addr: string;
  isUp: boolean;
  lastSeenSecs?: number;
  dataPartition?: string;
  metadataPartition?: string;
  zone: string;
  capacity?: number;
  tags: string[];
}

// Access key types
export interface AccessKey {
  accessKeyId: string;
  secretAccessKey: string;
  name?: string;
  bucketPermissions: Record<string, BucketPermission>;
}

export interface BucketPermission {
  read: boolean;
  write: boolean;
  owner: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Authentication types
export interface AuthUser {
  username: string;
  isAuthenticated: boolean;
}

// Object storage types
export interface S3Object {
  key: string;
  lastModified: Date;
  size: number;
  storageClass: string;
  etag: string;
}

export interface S3Folder {
  prefix: string;
}

// Theme types
export type Theme = "light" | "dark" | "auto";

import { LucideIcon } from "lucide-react";

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

// Garage API types
// 健康检查响应
export interface GarageHealthResponse {
  status: 'healthy' | 'degraded' | 'fail';
  checks?: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'fail';
      message?: string;
    };
  };
}

// 集群状态
export interface GarageClusterStatus {
  clusterId?: string;
  layoutVersion?: number;
  nodes?: GarageNode[];
  knownNodes?: GarageNode[];
}

// 集群布局
export interface GarageClusterLayout {
  version: number;
  roles: { [nodeId: string]: GarageNodeRole };
  stagedRoleChanges: { [nodeId: string]: GarageNodeRole };
}

// 节点信息
export interface GarageNode {
  id: string;
  garageVersion?: string;
  hostname?: string;
  addr?: string;
  isUp?: boolean;
  lastSeenSecsAgo?: number | null;
  role?: GarageNodeRole;
  draining?: boolean;
  dataPartition?: {
    available: number;
    total: number;
  };
  metadataPartition?: {
    available: number;
    total: number;
  };
}

// 节点角色
export interface GarageNodeRole {
  zone: string;
  capacity?: number;
  tags?: string[];
}

// 存储桶信息
export interface GarageBucket {
  id: string;
  globalAliases: string[];
  localAliases?: { [key: string]: string };
  websiteAccess?: boolean;
  corsRules?: GarageCorsRule[];
  lifecycleConfiguration?: GarageLifecycleRule[];
  quotas?: GarageBucketQuotas;
}

// 存储桶详细信息
export interface GarageBucketInfo extends GarageBucket {
  keys?: GarageKeyPermission[];
  objects?: number;
  bytes?: number;
  unfinishedUploads?: number;
}

// 创建存储桶请求
export interface GarageCreateBucketRequest {
  globalAlias?: string;
  localAlias?: {
    keyId: string;
    alias: string;
  };
}

// CORS 规则
export interface GarageCorsRule {
  id?: string;
  allowedHeaders?: string[];
  allowedMethods: string[];
  allowedOrigins: string[];
  exposeHeaders?: string[];
  maxAgeSeconds?: number;
}

// 生命周期规则
export interface GarageLifecycleRule {
  id: string;
  status: 'Enabled' | 'Disabled';
  filter?: {
    prefix?: string;
    tags?: { [key: string]: string };
  };
  expiration?: {
    days?: number;
    date?: string;
  };
  abortIncompleteMultipartUpload?: {
    daysAfterInitiation: number;
  };
}

// 存储桶配额
export interface GarageBucketQuotas {
  maxSize?: number;
  maxObjects?: number;
}

// 访问密钥信息
export interface GarageKey {
  accessKeyId: string;
  name?: string;
  secretAccessKey?: string;
  permissions: GarageKeyPermissions;
}

// 访问密钥详细信息
export interface GarageKeyInfo extends GarageKey {
  buckets?: GarageKeyPermission[];
}

// 创建访问密钥请求
export interface GarageCreateKeyRequest {
  name?: string;
}

// 密钥权限
export interface GarageKeyPermissions {
  createBucket?: boolean;
}

// 密钥对存储桶的权限
export interface GarageKeyPermission {
  bucketId: string;
  permissions: {
    read?: boolean;
    write?: boolean;
    owner?: boolean;
  };
}

// API 错误响应
export interface GarageErrorResponse {
  code: string;
  message: string;
  path?: string;
  timestamp?: string;
}
