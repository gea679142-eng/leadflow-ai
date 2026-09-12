import { NextResponse } from 'next/server';
import { users, settings, uid, now } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  if (users.find(u => u.email === email)) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

  const user = {
    id: uid(),
    email,
    passwordHash: await hashPassword(password),
    name: name || email.split('@')[0],
    language: 'en',
    plan: 'free' as const,
    dailyLimit: 50,
    createdAt: now(),
  };
  users.push(user);
  settings.push({ userId: user.id, deepseekKey: '', dailyLimit: 50, hourlyLimit: 20, minInterval: 15, maxInterval: 45 });

  const token = await signToken(user.id, user.email);
  const res = NextResponse.json({ success: true, email: user.email });
  res.cookies.set('lf_token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 3600 });
  return res;
}
