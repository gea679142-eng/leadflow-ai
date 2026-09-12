'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useEffect, useState } from 'react';

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(setRecords)
      .catch(() => {});
  }, []);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Send Records</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>Message sending history</p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{records.filter(r => r.status === 'sent').length}</div>
          <div style={{ fontSize: 12, color: '#10b981' }}>Sent</div>
        </div>
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{records.filter(r => r.status === 'failed').length}</div>
          <div style={{ fontSize: 12, color: '#f87171' }}>Failed</div>
        </div>
        <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{records.filter(r => r.status === 'pending').length}</div>
          <div style={{ fontSize: 12, color: '#f59e0b' }}>Pending</div>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {records.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--border)', gap: 16 }}>
            <div style={{ flex: 1, fontSize: 13 }}>{r.content?.slice(0, 80)}...</div>
            <span style={{
              fontSize: 11, padding: '2px 8px', borderRadius: 4,
              background: r.status === 'sent' ? 'rgba(16,185,129,0.2)' : r.status === 'failed' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
              color: r.status === 'sent' ? '#10b981' : r.status === 'failed' ? '#f87171' : '#f59e0b'
            }}>{r.status}</span>
            <span style={{ fontSize: 11, color: 'var(--text2)' }}>{r.sentAt || '—'}</span>
          </div>
        ))}
        {records.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>No messages sent yet.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
