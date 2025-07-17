import { handleGarageAPIResponse } from '@/lib/api-error-handler';
import { NextRequest } from 'next/server';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

interface RoleChangeRequest {
  id: string;
  change: {
    zone: string;
    capacity: number | null;
    tags: string[];
  };
}

interface UpdateLayoutRequest {
  roles: RoleChangeRequest[];
}

interface GarageRoleUpdate {
  id: string;
  zone: string;
  capacity: number | null;
  tags: string[];
}

interface GarageUpdateLayoutRequest {
  roles: GarageRoleUpdate[];
}

export async function POST(request: NextRequest) {
  const body: UpdateLayoutRequest = await request.json();

  // 转换前端格式到 Garage API 格式
  const garageRequest: GarageUpdateLayoutRequest = {
    roles: body.roles.map(role => ({
      id: role.id,
      zone: role.change.zone,
      capacity: role.change.capacity,
      tags: role.change.tags
    }))
  };

  console.log('Original request:', JSON.stringify(body, null, 2));
  console.log('Transformed request:', JSON.stringify(garageRequest, null, 2));

  const response = await fetch(`${GARAGE_API_BASE_URL}/v2/UpdateClusterLayout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(garageRequest),
  });

  return handleGarageAPIResponse(response, true);
}
