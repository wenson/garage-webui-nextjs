import { handleGarageAPIResponse } from '@/lib/api-error-handler';
import { NextRequest } from 'next/server';

const GARAGE_API_BASE_URL = process.env.GARAGE_API_BASE_URL || 'http://localhost:3903';
const GARAGE_API_ADMIN_KEY = process.env.GARAGE_API_ADMIN_KEY || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const search = searchParams.get('search');

  // 构建目标URL的查询参数
  const targetParams = new URLSearchParams();
  if (id) targetParams.set('id', id);
  if (search) targetParams.set('search', search);

  const queryString = targetParams.toString();
  const targetUrl = `${GARAGE_API_BASE_URL}/v2/GetAdminTokenInfo${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(targetUrl, {
    headers: {
      'Authorization': `Bearer ${GARAGE_API_ADMIN_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return handleGarageAPIResponse(response, true);
}
