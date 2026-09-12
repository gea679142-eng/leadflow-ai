'use client';

import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.email) setEmail(data.email);
        else router.push('/auth/login');
      })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  if (!email) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={email} />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
