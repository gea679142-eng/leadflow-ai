import { NextResponse } from 'next/server';
import { messages } from '@/lib/db';
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
  return NextResponse.json(messages.filter(m => m.userId === userId));
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { leadId, content } = await req.json();
  const msg = {
    id: Math.random().toString(36).substring(2),
    leadId,
    userId,
    content,
    status: 'sent' as const,
    sentAt: new Date().toLocaleTimeString(),
  };
  messages.push(msg);
  return NextResponse.json(msg);
}
