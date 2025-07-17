import { handleGarageAPIResponse } from '@/lib/api-error-handler';
import { NextRequest } from 'next/server';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bucketId } = await params;

  const response = await fetch(`${GARAGE_API_BASE_URL}/v2/DeleteBucket/${encodeURIComponent(bucketId)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return handleGarageAPIResponse(response, true);
}
