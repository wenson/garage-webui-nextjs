import { handleGarageAPIResponse } from '@/lib/api-error-handler';
import { NextRequest } from 'next/server';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bucketName = searchParams.get('bucketName');
  const objectKey = searchParams.get('objectKey');

  if (!bucketName || !objectKey) {
    return Response.json(
      { error: 'bucketName and objectKey parameters are required' },
      { status: 400 }
    );
  }

  const response = await fetch(
    `${GARAGE_API_BASE_URL}/v2/InspectObject?bucketName=${bucketName}&objectKey=${objectKey}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
      },
    }
  );

  return handleGarageAPIResponse(response, true);
}
