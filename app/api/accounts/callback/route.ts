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
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/login?next=/dashboard', req.url));
  }

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const cookies = searchParams.get('cookies') || '';

  if (!platform || !cookies) {
    return NextResponse.redirect(new URL('/dashboard?connect_error=missing_params', req.url));
  }

  // Verify and save
  const idx = accounts.findIndex(a => a.userId === userId && a.platform === platform);
  if (idx >= 0) accounts.splice(idx, 1);

  accounts.push({
    id: uid(),
    userId,
    platform,
    username: `${platform}_user`,
    cookies,
    status: 'connected' as const,
    todaySent: 0,
    dailyLimit: 50,
    connectedAt: now(),
  });

  return NextResponse.redirect(new URL(`/dashboard?connected=${platform}`, req.url));
}
