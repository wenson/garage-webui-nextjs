import { useQuery } from '@tanstack/react-query';
import { garageAPIv2 } from '@/lib/garage-api-v2';
import { InspectObjectResponse } from '@/types/garage-api-v2';

interface UseInspectObjectParams {
  bucketId: string;
  key: string;
  enabled?: boolean;
}

export const useInspectObject = ({ bucketId, key, enabled = true }: UseInspectObjectParams) => {
  return useQuery<InspectObjectResponse>({
    queryKey: ['inspect-object', bucketId, key],
    queryFn: () => garageAPIv2.inspectObject({ bucketId, key }),
    enabled: enabled && !!bucketId && !!key,
    staleTime: 30000, // 30秒内不重新获取
    retry: 2,
  });
};

export default useInspectObject;
