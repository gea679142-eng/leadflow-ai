import { NextResponse } from 'next/server';
import { leads } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get('cookie')?.match(/lf_token=([^;]+)/)?.[1];
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.userId || null;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(leads.filter(l => l.userId === userId));
}
