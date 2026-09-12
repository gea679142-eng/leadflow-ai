'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', desc: 'Groups, Pages, Marketplace' },
  { id: 'reddit', name: 'Reddit', icon: '👽', desc: 'Subreddits, comments, DMs' },
  { id: 'instagram', name: 'Instagram', icon: '📷', desc: 'Posts, comments, DMs' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', desc: 'Videos, comments, DMs' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', desc: 'Videos, comments, DMs' },
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', desc: 'Posts, replies, DMs' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', desc: 'Posts, comments, InMail' },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('api');
  const [deepseekKey, setDeepseekKey] = useState('sk-zffxchulxmkqwrdopmulavmncbgfjsznwohyqocbifuukxnc');
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/accounts')
      .then(r => r.json())
      .then(setAccounts)
      .catch(() => {});
  }, []);

  const connectAccount = async (platform: string) => {
    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, cookies: cookies[platform] || '' }),
    });
    if (res.ok) {
      fetch('/api/accounts').then(r => r.json()).then(setAccounts);
    }
  };

  const saveKey = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deepseekKey }),
    });
    alert('API key saved!');
  };

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Settings</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>Configure API keys, platform accounts, and sending</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { id: 'api', label: 'AI API' },
          { id: 'accounts', label: 'Platform Accounts' },
          { id: 'send', label: 'Sending' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '8px 16px', borderRadius: 8, background: tab === t.id ? 'var(--gradient)' : 'var(--surface2)', border: '1px solid var(--border)', color: tab === t.id ? '#fff' : 'var(--text2)', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'api' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 500 }}>
          <h3 style={{ marginTop: 0 }}>DeepSeek API Key</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Your SiliconFlow DeepSeek API key</p>
          <input type="password" value={deepseekKey} onChange={e => setDeepseekKey(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '8px 0 16px' }} />
          <button onClick={saveKey} style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>Save Key</button>
        </div>
      )}

      {tab === 'accounts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {PLATFORMS.map(p => {
            const acc = accounts.find(a => a.platform === p.id);
            return (
              <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: acc ? '#10b981' : 'var(--text2)' }}>{acc ? 'Connected' : 'Not connected'}</div>
                  </div>
                </div>
                {!acc && (
                  <>
                    <textarea placeholder="Paste cookies here..." value={cookies[p.id] || ''}
                      onChange={e => setCookies({ ...cookies, [p.id]: e.target.value })}
                      style={{ width: '100%', height: 60, padding: 8, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 11, marginBottom: 8 }} />
                    <button onClick={() => connectAccount(p.id)} style={{ width: '100%', padding: '8px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>Connect</button>
                  </>
                )}
                {acc && <div style={{ fontSize: 12, color: 'var(--text2)' }}>User: {acc.username} · Sent today: {acc.todaySent}</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'send' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, maxWidth: 500 }}>
          <h3 style={{ marginTop: 0 }}>Sending Limits</h3>
          <p style={{ fontSize: 13, color: 'var(--text2)' }}>Configure safe sending limits per platform</p>
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Daily limit: 50</label>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Hourly limit: 20</label>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Random interval: 15-45 min</label>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
