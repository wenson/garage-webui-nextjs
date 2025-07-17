// Garage Admin API v2 TypeScript Types
// Generated from OpenAPI spec: https://garagehq.deuxfleurs.fr/api/garage-admin-v2.json

// ============================================================================
// CLUSTER HEALTH AND STATUS
// ============================================================================

export interface GetClusterHealthResponse {
  status: 'healthy' | 'degraded' | 'unavailable';
  knownNodes: number;
  connectedNodes: number;
  storageNodes: number;
  storageNodesOk: number;
  partitions: number;
  partitionsQuorum: number;
  partitionsAllOk: number;
}

export interface NodeResp {
  id: string;
  isUp: boolean;
  draining: boolean;
  addr?: string | null;
  hostname?: string | null;
  garageVersion?: string | null;
  lastSeenSecsAgo?: number | null;
  role?: NodeAssignedRole | null;
  dataPartition?: FreeSpaceResp | null;
  metadataPartition?: FreeSpaceResp | null;
}

export interface NodeAssignedRole {
  zone: string;
  capacity?: number | null;
  tags: string[];
}

export interface FreeSpaceResp {
  total: number;
  available: number;
}

export interface GetClusterStatusResponse {
  layoutVersion: number;
  nodes: NodeResp[];
}

// ============================================================================
// BUCKET MANAGEMENT
// ============================================================================

export interface GetBucketInfoResponse {
  id: string;
  created: string; // RFC 3339 date-time
  globalAliases: string[];
  websiteAccess: boolean;
  websiteConfig?: GetBucketInfoWebsiteResponse | null;
  quotas: ApiBucketQuotas;
  keys: GetBucketInfoKey[];
  objects: number;
  bytes: number;
  unfinishedUploads: number;
  unfinishedMultipartUploads: number;
  unfinishedMultipartUploadParts: number;
  unfinishedMultipartUploadBytes: number;
}

export interface GetBucketInfoWebsiteResponse {
  indexDocument: string;
  errorDocument?: string | null;
}

export interface ApiBucketQuotas {
  maxSize?: number | null;
  maxObjects?: number | null;
}

export interface GetBucketInfoKey {
  accessKeyId: string;
  name: string;
  permissions: ApiBucketKeyPerm;
  bucketLocalAliases: string[];
}

export interface ApiBucketKeyPerm {
  owner?: boolean;
  read?: boolean;
  write?: boolean;
}

export type ListBucketsResponse = ListBucketsResponseItem[];

export interface ListBucketsResponseItem {
  id: string;
  created: string;
  globalAliases: string[];
  localAliases: BucketLocalAlias[];
}

export interface BucketLocalAlias {
  accessKeyId: string;
  alias: string;
}

export interface CreateBucketRequest {
  globalAlias?: string | null;
  localAlias?: CreateBucketLocalAlias | null;
}

export interface CreateBucketLocalAlias {
  accessKeyId: string;
  alias: string;
  allow?: ApiBucketKeyPerm;
}

export interface UpdateBucketRequestBody {
  quotas?: ApiBucketQuotas | null;
  websiteAccess?: UpdateBucketWebsiteAccess | null;
}

export interface UpdateBucketWebsiteAccess {
  enabled: boolean;
  indexDocument?: string | null;
  errorDocument?: string | null;
}

// ============================================================================
// ACCESS KEY MANAGEMENT
// ============================================================================

export interface GetKeyInfoResponse {
  accessKeyId: string;
  name: string;
  expired: boolean;
  created?: string | null;
  expiration?: string | null;
  permissions: KeyPerm;
  buckets: KeyInfoBucketResponse[];
  secretAccessKey?: string | null;
}

export interface KeyPerm {
  createBucket?: boolean;
}

export interface KeyInfoBucketResponse {
  id: string;
  globalAliases: string[];
  localAliases: string[];
  permissions: ApiBucketKeyPerm;
}

export type ListKeysResponse = ListKeysResponseItem[];

export interface ListKeysResponseItem {
  id: string;
  name: string;
  expired: boolean;
  created?: string | null;
  expiration?: string | null;
}

export type CreateKeyRequest = UpdateKeyRequestBody;

export interface UpdateKeyRequestBody {
  name?: string | null;
  allow?: KeyPerm | null;
  deny?: KeyPerm | null;
  expiration?: string | null;
  neverExpires?: boolean;
}

export interface ImportKeyRequest {
  accessKeyId: string;
  secretAccessKey: string;
  name?: string | null;
}

// ============================================================================
// ADMIN TOKEN MANAGEMENT
// ============================================================================

export interface GetAdminTokenInfoResponse {
  id?: string | null;
  name: string;
  expired: boolean;
  created?: string | null;
  expiration?: string | null;
  scope: string[];
}

export type ListAdminTokensResponse = GetAdminTokenInfoResponse[];

export interface CreateAdminTokenResponse extends GetAdminTokenInfoResponse {
  secretToken: string;
}

export interface UpdateAdminTokenRequestBody {
  name?: string | null;
  expiration?: string | null;
  neverExpires?: boolean;
  scope?: string[] | null;
}

// ============================================================================
// CLUSTER LAYOUT MANAGEMENT
// ============================================================================

export interface GetClusterLayoutResponse {
  version: number;
  roles: LayoutNodeRole[];
  parameters: LayoutParameters;
  partitionSize: number;
  stagedRoleChanges: NodeRoleChange[];
  stagedParameters?: LayoutParameters | null;
}

export interface LayoutNodeRole {
  id: string;
  zone: string;
  capacity?: number | null;
  tags: string[];
  storedPartitions?: number | null;
  usableCapacity?: number | null;
}

export interface LayoutParameters {
  zoneRedundancy: ZoneRedundancy;
}

export type ZoneRedundancy = 
  | { atLeast: number }
  | 'maximum';

export interface NodeRoleChange {
  id: string;
  change: NodeRoleChangeEnum;
}

export type NodeRoleChangeEnum = 
  | { remove: boolean }
  | NodeAssignedRole;

export interface UpdateClusterLayoutRequest {
  roles?: NodeRoleChange[];
  parameters?: LayoutParameters | null;
}

export interface ApplyClusterLayoutRequest {
  version: number;
}

export interface ApplyClusterLayoutResponse {
  layout: GetClusterLayoutResponse;
  message: string[];
}

// ============================================================================
// PERMISSIONS AND ALIASES
// ============================================================================

export interface BucketKeyPermChangeRequest {
  bucketId: string;
  accessKeyId: string;
  permissions: ApiBucketKeyPerm;
}

export type AllowBucketKeyRequest = BucketKeyPermChangeRequest;
export type DenyBucketKeyRequest = BucketKeyPermChangeRequest;

export type BucketAliasEnum = 
  | { globalAlias: string }
  | { localAlias: string; accessKeyId: string };

export interface AddBucketAliasRequest {
  bucketId: string;
  alias: BucketAliasEnum;
}

export interface RemoveBucketAliasRequest {
  bucketId: string;
  alias: BucketAliasEnum;
}

// ============================================================================
// NODE AND WORKER MANAGEMENT
// ============================================================================

export type ConnectClusterNodesRequest = string[];

export type ConnectClusterNodesResponse = ConnectNodeResponse[];

export interface ConnectNodeResponse {
  success: boolean;
  error?: string | null;
}

export interface WorkerInfoResp {
  id: number;
  name: string;
  state: WorkerStateResp;
  errors: number;
  consecutiveErrors: number;
  persistentErrors?: number | null;
  freeform: string[];
  lastError?: WorkerLastError | null;
  progress?: string | null;
  queueLength?: number | null;
  tranquility?: number | null;
}

export type WorkerStateResp = 
  | 'busy'
  | 'idle' 
  | 'done'
  | { throttled: { durationSecs: number } };

export interface WorkerLastError {
  message: string;
  secsAgo: number;
}

// ============================================================================
// OBJECT INSPECTION
// ============================================================================

export interface InspectObjectResponse {
  bucketId: string;
  key: string;
  versions: InspectObjectVersion[];
}

export interface InspectObjectVersion {
  uuid: string;
  timestamp: string;
  encrypted: boolean;
  uploading: boolean;
  aborted: boolean;
  deleteMarker: boolean;
  inline: boolean;
  etag?: string | null;
  size?: number | null;
  headers: [string, string][];
  blocks?: InspectObjectBlock[];
}

export interface InspectObjectBlock {
  partNumber: number;
  offset: number;
  hash: string;
  size: number;
}

// ============================================================================
// MAINTENANCE AND REPAIR
// ============================================================================

export interface CleanupIncompleteUploadsRequest {
  bucketId: string;
  olderThanSecs: number;
}

export interface CleanupIncompleteUploadsResponse {
  uploadsDeleted: number;
}

export type RepairType = 
  | 'tables'
  | 'blocks'
  | 'versions'
  | 'multipartUploads'
  | 'blockRefs'
  | 'blockRc'
  | 'rebalance'
  | 'aliases'
  | { scrub: ScrubCommand };

export type ScrubCommand = 'start' | 'pause' | 'resume' | 'cancel';

// ============================================================================
// BLOCK MANAGEMENT
// ============================================================================

export interface BlockError {
  blockHash: string;
  refcount: number;
  errorCount: number;
  lastTrySecsAgo: number;
  nextTryInSecs: number;
}

export interface LocalGetBlockInfoResponse {
  blockHash: string;
  refcount: number;
  versions: BlockVersion[];
}

export interface BlockVersion {
  versionId: string;
  refDeleted: boolean;
  versionDeleted: boolean;
  garbageCollected: boolean;
  backlink?: BlockVersionBacklink | null;
}

export type BlockVersionBacklink = 
  | { object: { bucketId: string; key: string } }
  | { 
      upload: { 
        uploadId: string;
        bucketId?: string | null;
        key?: string | null;
        uploadDeleted: boolean;
        uploadGarbageCollected: boolean;
      } 
    };

// ============================================================================
// STATISTICS AND MONITORING
// ============================================================================

export interface GetClusterStatisticsResponse {
  freeform: string;
}

export interface LocalGetNodeInfoResponse {
  nodeId: string;
  garageVersion: string;
  rustVersion: string;
  dbEngine: string;
  garageFeatures?: string[] | null;
}

export interface LocalGetNodeStatisticsResponse {
  freeform: string;
}

export interface PreviewClusterLayoutChangesResponse {
  message?: string[];
  newLayout?: GetClusterLayoutResponse;
  error?: string;
}

// ============================================================================
// MULTI-NODE RESPONSE WRAPPERS
// ============================================================================

export interface MultiResponse<T> {
  success: Record<string, T>;
  error: Record<string, string>;
}

// ============================================================================
// API CLIENT INTERFACES
// ============================================================================

export interface GarageAdminAPIv2 {
  // Special endpoints
  health(): Promise<void>;
  metrics(): Promise<string>;
  checkDomain(domain: string): Promise<void>;

  // Cluster health and status
  getClusterHealth(): Promise<GetClusterHealthResponse>;
  getClusterStatus(): Promise<GetClusterStatusResponse>;
  getClusterStatistics(): Promise<GetClusterStatisticsResponse>;

  // Bucket management
  listBuckets(): Promise<ListBucketsResponse>;
  getBucketInfo(params: { id?: string; globalAlias?: string; search?: string }): Promise<GetBucketInfoResponse>;
  createBucket(request: CreateBucketRequest): Promise<GetBucketInfoResponse>;
  updateBucket(id: string, request: UpdateBucketRequestBody): Promise<GetBucketInfoResponse>;
  deleteBucket(id: string): Promise<void>;

  // Bucket aliases
  addBucketAlias(request: AddBucketAliasRequest): Promise<GetBucketInfoResponse>;
  removeBucketAlias(request: RemoveBucketAliasRequest): Promise<GetBucketInfoResponse>;

  // Access keys
  listKeys(): Promise<ListKeysResponse>;
  getKeyInfo(params: { id?: string; search?: string; showSecretKey?: boolean }): Promise<GetKeyInfoResponse>;
  createKey(request: CreateKeyRequest): Promise<GetKeyInfoResponse>;
  updateKey(id: string, request: UpdateKeyRequestBody): Promise<GetKeyInfoResponse>;
  deleteKey(id: string): Promise<void>;
  importKey(request: ImportKeyRequest): Promise<GetKeyInfoResponse>;

  // Permissions
  allowBucketKey(request: AllowBucketKeyRequest): Promise<GetBucketInfoResponse>;
  denyBucketKey(request: DenyBucketKeyRequest): Promise<GetBucketInfoResponse>;

  // Admin tokens
  listAdminTokens(): Promise<ListAdminTokensResponse>;
  getAdminTokenInfo(params: { id?: string; search?: string }): Promise<GetAdminTokenInfoResponse>;
  getCurrentAdminTokenInfo(): Promise<GetAdminTokenInfoResponse>;
  createAdminToken(request: UpdateAdminTokenRequestBody): Promise<CreateAdminTokenResponse>;
  updateAdminToken(id: string, request: UpdateAdminTokenRequestBody): Promise<GetAdminTokenInfoResponse>;
  deleteAdminToken(id: string): Promise<void>;

  // Cluster layout
  getClusterLayout(): Promise<GetClusterLayoutResponse>;
  updateClusterLayout(request: UpdateClusterLayoutRequest): Promise<GetClusterLayoutResponse>;
  applyClusterLayout(request: ApplyClusterLayoutRequest): Promise<ApplyClusterLayoutResponse>;
  revertClusterLayout(): Promise<GetClusterLayoutResponse>;
  previewClusterLayoutChanges(): Promise<PreviewClusterLayoutChangesResponse>;

  // Node management
  connectClusterNodes(nodes: string[]): Promise<ConnectClusterNodesResponse>;
  getNodeInfo(node: string): Promise<MultiResponse<LocalGetNodeInfoResponse>>;
  getNodeStatistics(node: string): Promise<MultiResponse<LocalGetNodeStatisticsResponse>>;

  // Object inspection
  inspectObject(params: { bucketId: string; key: string }): Promise<InspectObjectResponse>;

  // Maintenance
  cleanupIncompleteUploads(request: CleanupIncompleteUploadsRequest): Promise<CleanupIncompleteUploadsResponse>;
}
