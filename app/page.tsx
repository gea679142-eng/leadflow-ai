import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'leadflow-secret-key-change-in-production-2026'
);

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lf_token')?.value;
  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      valid = true;
    } catch {}
  }
  redirect(valid ? '/dashboard' : '/auth/login');
}
