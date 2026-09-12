import { NextResponse } from 'next/server';
import { tasks, leads, settings, uid, now } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { optimizeKeywords } from '@/lib/deepseek';

async function getUserId(req: Request): Promise<string | null> {
  const token = req.headers.get('cookie')?.match(/lf_token=([^;]+)/)?.[1];
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.userId || null;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(tasks.filter(t => t.userId === userId));
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, keywords, platforms, targetCount, strategy } = await req.json();

  // Get user's DeepSeek key
  const userSettings = settings.find(s => s.userId === userId);
  const apiKey = userSettings?.deepseekKey || process.env.DEEPSEEK_KEY || '';

  // AI optimize keywords
  let optimizedKeywords = keywords;
  if (apiKey && keywords) {
    try {
      optimizedKeywords = await optimizeKeywords(apiKey, keywords);
    } catch (e) {
      console.error('DeepSeek keyword optimization failed:', e);
    }
  }

  const task = {
    id: uid(),
    userId,
    name: name || 'Untitled',
    keywords,
    optimizedKeywords,
    platforms: platforms || [],
    strategy: strategy || 'auto',
    targetCount: targetCount || 100,
    status: 'pending' as const,
    progress: 0,
    discovered: 0,
    createdAt: now(),
  };
  tasks.push(task);

  return NextResponse.json(task);
}
