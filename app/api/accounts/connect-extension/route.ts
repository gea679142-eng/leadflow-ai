import { NextResponse } from 'next/server';
import { accounts, uid, now } from '@/lib/db';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'leadflow-secret-key-change-in-production-2026'
);

export async function POST(req: Request) {
  const { platform, cookies: cookieStr, token } = await req.json();

  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Remove existing
    const idx = accounts.findIndex(a => a.userId === userId && a.platform === platform);
    if (idx >= 0) accounts.splice(idx, 1);

    accounts.push({
      id: uid(),
      userId,
      platform,
      username: `${platform}_user`,
      cookies: cookieStr || '',
      status: 'connected' as const,
      todaySent: 0,
      dailyLimit: 50,
      connectedAt: now(),
    });

    return NextResponse.json({ status: 'connected', platform });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
