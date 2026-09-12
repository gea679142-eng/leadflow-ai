import { NextResponse } from 'next/server';
import { tasks, leads, uid, now } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

function getUserId(req: Request): string | null {
  const token = req.headers.get('cookie')?.match(/lf_token=([^;]+)/)?.[1];
  if (!token) return null;
  return verifyToken(token).then(p => p?.userId || null) as any;
}

export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(tasks.filter(t => t.userId === userId));
}

export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, keywords, platforms, targetCount } = await req.json();

  const task = {
    id: uid(),
    userId,
    name: name || 'Untitled',
    keywords,
    platforms: platforms || [],
    targetCount: targetCount || 100,
    status: 'searching' as const,
    progress: 0,
    discovered: 0,
    filtered: 0,
    createdAt: now(),
  };
  tasks.push(task);

  // Simulate progress
  setTimeout(() => { task.progress = 50; task.status = 'filtering'; task.discovered = Math.floor(targetCount * 2); }, 1000);
  setTimeout(() => {
    task.progress = 100;
    task.status = 'completed';
    task.filtered = Math.floor(targetCount * 0.6);
    // Generate sample leads
    for (let i = 0; i < Math.min(task.filtered, 20); i++) {
      leads.push({
        id: uid(),
        taskId: task.id,
        userId,
        platform: task.platforms[i % task.platforms.length] || 'facebook',
        username: `user_${Math.random().toString(36).substring(2, 8)}`,
        profileUrl: '#',
        avatar: '',
        intentScore: 60 + Math.floor(Math.random() * 40),
        matchReason: 'Discussed related topic in posts',
        followers: Math.floor(Math.random() * 50000),
        source: 'search',
        status: 'pending',
      });
    }
  }, 3000);

  return NextResponse.json(task);
}
