'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ todaySent: 0, remaining: 50, activeAccounts: 0, totalLeads: 0 });

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards = [
    { label: t('dashboard.sent_today'), value: stats.todaySent, change: '+12%', color: '#6366f1' },
    { label: t('dashboard.remaining'), value: stats.remaining, change: 'today', color: '#8b5cf6' },
    { label: t('dashboard.accounts'), value: stats.activeAccounts, change: 'online', color: '#10b981' },
    { label: t('dashboard.total_leads'), value: stats.totalLeads, change: '+8%', color: '#f59e0b' },
  ];

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{t('nav.dashboard')}</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 32px' }}>{t('dashboard.welcome')}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {cards.map(c => (
          <div key={c.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📊</div>
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{c.change}</span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}>{t('dashboard.recent')}</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{t('dashboard.start_task')}</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 16px' }}>{t('settings.tab_accounts')}</h3>
          <p style={{ color: 'var(--text2)', fontSize: 14 }}>{t('dashboard.connect_platforms')}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
