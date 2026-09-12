import { NextResponse } from 'next/server';
import { messages, leads, accounts } from '@/lib/db';
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

  const sent = messages.filter(m => m.userId === userId && m.status === 'sent');
  return NextResponse.json({
    todaySent: sent.length,
    remaining: 50 - sent.length,
    activeAccounts: accounts.filter(a => a.userId === userId && a.status === 'connected').length,
    totalLeads: leads.filter(l => l.userId === userId).length,
  });
}
