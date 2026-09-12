'use client';

import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetch('/api/auth/me', { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        clearTimeout(timeout);
        if (data?.email) setEmail(data.email);
        else window.location.href = '/auth/login';
      })
      .catch(() => {
        clearTimeout(timeout);
        window.location.href = '/auth/login';
      });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  if (!email) return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
      Loading...
      <div style={{ marginTop: 16 }}>
        <a href="/auth/login" style={{ color: '#6366f1', fontSize: 14 }}>Click here to login</a>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={email} />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
