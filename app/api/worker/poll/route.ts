import { NextResponse } from 'next/server';
import { tasks, leads, accounts, settings, uid, now } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { generateDm, scoreLead } from '@/lib/deepseek';

async function getUserId(req: Request): Promise<string | null> {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!auth) return null;
  const p = await verifyToken(auth);
  return p?.userId || null;
}

// Worker polls for pending tasks
export async function GET(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Return pending tasks for this user
  const pending = tasks.filter(t => t.userId === userId && t.status === 'pending');
  return NextResponse.json({ tasks: pending });
}

// Worker reports found leads
export async function POST(req: Request) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { taskId, platform, foundLeads } = await req.json();
  const task = tasks.find(t => t.id === taskId && t.userId === userId);
  if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

  const userSettings = settings.find(s => s.userId === userId);
  const apiKey = userSettings?.deepseekKey || process.env.DEEPSEEK_KEY || '';

  let added = 0;
  for (const lead of foundLeads) {
    // Deduplicate: skip if already in leads for this user
    const exists = leads.find(l =>
      l.userId === userId &&
      l.platform === platform &&
      (l.profileUrl === lead.profileUrl || l.username === lead.username)
    );
    if (exists) continue;

    // AI score the lead
    let score = 50;
    let reason = 'Relevant to search keywords';
    if (apiKey) {
      try {
        const scored = await scoreLead(apiKey,
          `Username: ${lead.username}, Bio: ${lead.bio || ''}`,
          task.keywords
        );
        score = scored.score;
        reason = scored.reason;
      } catch {}
    }

    // AI generate DM
    let dmContent = `Hi ${lead.username}, I noticed your posts about this topic. Would love to connect!`;
    if (apiKey) {
      try {
        dmContent = await generateDm(apiKey, lead.username, lead.bio || '', task.keywords);
      } catch {}
    }

    leads.push({
      id: uid(),
      taskId: task.id,
      userId,
      platform,
      username: lead.username,
      profileUrl: lead.profileUrl,
      intentScore: score,
      matchReason: reason,
      status: 'pending' as const,
      contacted: false,
    });
    added++;
  }

  task.discovered = (task.discovered || 0) + added;
  if (task.discovered >= task.targetCount) {
    task.status = 'completed';
    task.progress = 100;
  } else {
    task.status = 'running';
    task.progress = Math.min(95, Math.round((task.discovered / task.targetCount) * 100));
  }

  return NextResponse.json({ added, total: task.discovered, status: task.status });
}
