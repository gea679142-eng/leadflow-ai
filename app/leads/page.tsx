'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/leads')
      .then(r => r.json())
      .then(setLeads)
      .catch(() => {});
  }, []);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.platform === filter);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Leads</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>{filtered.length} leads found</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'facebook', 'instagram', 'tiktok', 'youtube', 'x', 'linkedin'].map(p => (
          <button key={p} onClick={() => setFilter(p)}
            style={{ padding: '6px 14px', borderRadius: 8, background: filter === p ? 'var(--gradient)' : 'var(--surface2)', border: '1px solid var(--border)', color: filter === p ? '#fff' : 'var(--text2)', cursor: 'pointer', fontSize: 12 }}>
            {p}
          </button>
        ))}
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
              <div style={{ fontWeight: 700, color: lead.intentScore > 80 ? '#10b981' : lead.intentScore > 60 ? '#f59e0b' : '#f87171' }}>{lead.intentScore}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{lead.platform}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No leads yet. Create a search task first.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
