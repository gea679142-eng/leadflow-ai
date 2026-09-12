'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

export default function LeadsPage() {
  const { t } = useI18n();
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(setLeads)
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.platform === filter);

  const STATUS_FLOW = [
    { key: 'pending', label: t('leads.found'), color: '#8888a0' },
    { key: 'friend_requested', label: t('leads.friend_requested'), color: '#f59e0b' },
    { key: 'friend_accepted', label: t('leads.friend_accepted'), color: '#3b82f6' },
    { key: 'messaged', label: t('leads.dm_sent'), color: '#10b981' },
  ];

  const getStatusColor = (status: string) => STATUS_FLOW.find(f => f.key === status)?.color || '#888';
  const getStatusLabel = (status: string) => STATUS_FLOW.find(f => f.key === status)?.label || status;

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{t('leads.title')}</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>{filtered.length} · {t('leads.subtitle')}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'facebook', 'reddit', 'instagram', 'tiktok', 'youtube', 'x', 'linkedin'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            style={{ padding: '6px 14px', borderRadius: 8, background: filter === p ? 'var(--gradient)' : 'var(--surface2)', border: '1px solid var(--border)', color: filter === p ? '#fff' : 'var(--text2)', cursor: 'pointer', fontSize: 12 }}>
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {STATUS_FLOW.map(s => {
          const count = leads.filter(l => (l.status || 'pending') === s.key).length;
          return (
            <div key={s.key} style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.map(lead => (
          <div key={lead.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {lead.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{lead.username}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{lead.matchReason}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${getStatusColor(lead.status)}20`, color: getStatusColor(lead.status), display: 'inline-block' }}>
                {getStatusLabel(lead.status)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{lead.platform}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>{t('leads.no_leads')}</div>
        )}
      </div>
    </DashboardLayout>
  );
}
