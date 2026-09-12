import { NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders } from '@/lib/auth';
import { users } from '@/lib/db';

export async function GET(req: Request) {
  const token = getTokenFromHeaders(req.headers) || req.headers.get('cookie')?.match(/lf_token=([^;]+)/)?.[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = users.find(u => u.id === payload.userId);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ email: user.email, name: user.name });
}
