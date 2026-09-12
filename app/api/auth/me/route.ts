import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'leadflow-secret-key-change-in-production-2026'
);

export async function GET(req: Request) {
  const token = req.headers.get('cookie')?.match(/lf_token=([^;]+)/)?.[1];
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ email: payload.email, name: payload.email });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
