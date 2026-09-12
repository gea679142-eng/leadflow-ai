import { NextResponse } from 'next/server';
import { settings } from '@/lib/db';
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
  return NextResponse.json(settings.find(s => s.userId === userId) || {});
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { deepseekKey } = await req.json();
  let s = settings.find(x => x.userId === userId);
  if (!s) {
    s = { userId, deepseekKey: '', dailyLimit: 50, hourlyLimit: 20, minInterval: 15, maxInterval: 45 };
    settings.push(s);
  }
  if (deepseekKey) s.deepseekKey = deepseekKey;
  return NextResponse.json({ success: true });
}
