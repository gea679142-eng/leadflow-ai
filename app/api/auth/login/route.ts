import { NextResponse } from 'next/server';
import { users } from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = users.find(u => u.email === email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const token = await signToken(user.id, user.email);
  const res = NextResponse.json({ success: true, email: user.email });
  res.cookies.set('lf_token', token, { httpOnly: true, path: '/', maxAge: 7 * 24 * 3600 });
  return res;
}
