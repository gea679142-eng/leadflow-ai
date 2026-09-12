'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';

export default function MessagesPage() {
  const [template, setTemplate] = useState('Hi {{username}}! I noticed your post about {{keyword}}. Would love to connect!');
  const [sending, setSending] = useState(false);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Messages</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>Manage DM templates and sending</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>DM Template</h3>
          <textarea value={template} onChange={e => setTemplate(e.target.value.slice(0, 500))}
            style={{ width: '100%', height: 120, padding: 12, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '8px 0' }} />
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{template.length}/500 chars</div>
          <p style={{ fontSize: 12, color: 'var(--text2)' }}>Variables: {'{{username}}'}, {'{{keyword}}'}, {'{{platform}}'}</p>
          <button style={{ padding: '10px 16px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer', marginTop: 12 }}>
            AI Personalize
          </button>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ marginTop: 0 }}>Send Control</h3>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>Status: {sending ? 'Sending' : 'Idle'}</div>
            <div style={{ height: 8, background: 'var(--surface2)', borderRadius: 4 }}>
              <div style={{ height: '100%', width: '0%', background: 'var(--gradient)', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setSending(true)} style={{ padding: '10px 20px', borderRadius: 8, background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Start</button>
            <button onClick={() => setSending(false)} style={{ padding: '10px 20px', borderRadius: 8, background: '#f59e0b', color: '#fff', border: 'none', cursor: 'pointer' }}>Pause</button>
            <button onClick={() => setSending(false)} style={{ padding: '10px 20px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Stop</button>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: 'var(--text2)' }}>
            <p>Hourly limit: 20/hour</p>
            <p>Interval: 15-45 min random</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
