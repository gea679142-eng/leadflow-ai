'use client';

import Sidebar from './Sidebar';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      })
      .then(data => {
        if (data?.email) {
          setEmail(data.email);
          setChecked(true);
        } else {
          window.location.href = '/auth/login';
        }
      })
      .catch(() => {
        window.location.href = '/auth/login';
      });
  }, []);

  if (!checked) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, color: 'var(--text2)' }}>Loading...</div>
          <div style={{ marginTop: 16 }}>
            <a href="/auth/login" style={{ color: '#6366f1', fontSize: 14 }}>Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar userEmail={email!} />
      <main style={{ marginLeft: 240, flex: 1, padding: 32, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
