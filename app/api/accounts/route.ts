import { NextResponse } from 'next/server';
import { accounts, uid, now } from '@/lib/db';
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
  return NextResponse.json(accounts.filter(a => a.userId === userId));
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { platform, cookies: cookieStr } = await req.json();

  const acc = {
    id: uid(),
    userId,
    platform,
    username: `${platform}_user`,
    cookies: cookieStr,
    status: 'connected' as const,
    todaySent: 0,
    dailyLimit: 50,
    connectedAt: now(),
  };
  accounts.push(acc);
  return NextResponse.json(acc);
}
