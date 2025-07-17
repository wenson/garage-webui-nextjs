import { useQuery } from "@tanstack/react-query";
import type { NodesHealth, Bucket, ClusterNode, AccessKey } from "@/types";
import { garageAPIv2 } from "@/lib/garage-api-v2";

// React Query hooks  
export const useNodesHealth = () => {
  return useQuery({
    queryKey: ["nodes-health"],
    queryFn: async () => {
      const health = await garageAPIv2.getClusterHealth();
      const status = await garageAPIv2.getClusterStatus();
      
      // 从 v2 API 响应中提取数据
      const healthData = health as unknown as Record<string, unknown>;
      const statusData = status as unknown as Record<string, unknown>;
      
      return {
        status: healthData.status === 'ok' ? 'healthy' : healthData.status === 'degraded' ? 'degraded' : 'unavailable',
        knownNodes: Array.isArray(statusData.knownNodes) ? statusData.knownNodes.length : Array.isArray(statusData.nodes) ? statusData.nodes.length : 0,
        connectedNodes: Array.isArray(statusData.nodes) ? statusData.nodes.filter((n: Record<string, unknown>) => n.status === 'up' || n.status === 'online').length : 0,
        storageNodes: Array.isArray(statusData.nodes) ? statusData.nodes.length : 0,
        storageNodesOk: Array.isArray(statusData.nodes) ? statusData.nodes.filter((n: Record<string, unknown>) => n.status === 'up' || n.status === 'online').length : 0,
        partitions: 256,
        partitionsQuorum: 256,
        partitionsAllOk: 256,
      } as NodesHealth;
    },
    refetchInterval: 30000,
  });
};

export const useBuckets = () => {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const buckets = await garageAPIv2.listBuckets();
      const bucketList = buckets as unknown as Record<string, unknown>[];
      
      return bucketList.map((bucket: Record<string, unknown>) => ({
        id: bucket.id as string,
        globalAliases: Array.isArray(bucket.globalAliases) ? bucket.globalAliases : [],
        localAliases: [],
        objects: 0,
        bytes: 0,
        unfinishedUploads: 0,
        quotas: bucket.quotas as Record<string, unknown> || {},
        websiteConfig: bucket.websiteAccess ? {
          indexDocument: "index.html",
          errorDocument: "error.html",
        } : undefined,
      })) as Bucket[];
    },
  });
};

export const useClusterNodes = () => {
  return useQuery({
    queryKey: ["cluster-nodes"],
    queryFn: async () => {
      const status = await garageAPIv2.getClusterStatus();
      const statusData = status as unknown as Record<string, unknown>;
      const nodes = Array.isArray(statusData.nodes) ? statusData.nodes : [];
      
      return nodes.map((node: Record<string, unknown>) => ({
        id: node.id as string,
        hostname: (node.hostname || node.addr || 'unknown') as string,
        addr: (node.addr || 'unknown') as string,
        isUp: Boolean(node.isUp),
        lastSeenSecs: (node.lastSeenSecsAgo as number) || 0,
        dataPartition: "0/256",
        metadataPartition: "0/256",
        zone: ((node.role as Record<string, unknown>)?.zone || "unknown") as string,
        capacity: ((node.role as Record<string, unknown>)?.capacity || 0) as number,
        tags: Array.isArray((node.role as Record<string, unknown>)?.tags) ? 
          ((node.role as Record<string, unknown>).tags as string[]) : [],
      })) as ClusterNode[];
    },
    refetchInterval: 10000,
  });
};

export const useAccessKeys = () => {
  return useQuery({
    queryKey: ["access-keys"],
    queryFn: async () => {
      const keys = await garageAPIv2.listKeys();
      const keyList = keys as unknown as Record<string, unknown>[];
      
      return keyList.map((key: Record<string, unknown>) => ({
        accessKeyId: key.accessKeyId as string,
        secretAccessKey: (key.secretAccessKey || "") as string,
        name: key.name as string,
        bucketPermissions: key.permissions as Record<string, unknown> || {},
      })) as AccessKey[];
    },
  });
};
