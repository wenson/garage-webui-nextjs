import { handleGarageAPIResponse } from '@/lib/api-error-handler';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

export async function GET() {
  const response = await fetch(`${GARAGE_API_BASE_URL}/v2/ConnectClusterNodes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
    },
  });

  return handleGarageAPIResponse(response, true);
}
