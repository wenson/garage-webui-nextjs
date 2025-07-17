import { handleGarageAPIResponse } from '@/lib/api-error-handler';
import { NextRequest } from 'next/server';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;

  const response = await fetch(`${GARAGE_API_BASE_URL}/v2/GetNodeStatistics?nodeId=${nodeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
    },
  });

  return handleGarageAPIResponse(response, true);
}
