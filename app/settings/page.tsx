'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

const PLATFORMS = [
  {
    id: 'facebook', name: 'Facebook', icon: '📘',
    dm: 'limited', dmDesc: '陌生人私信限~10条/24h',
    comment: true, commentDesc: '群组/帖子评论',
    strategy: '加好友→私信 / 群组评论',
  },
  {
    id: 'reddit', name: 'Reddit', icon: '👽',
    dm: 'yes', dmDesc: '直接私信（需karma>100）',
    comment: true, commentDesc: 'Subreddit评论',
    strategy: '直接私信 / 评论帖子',
  },
  {
    id: 'instagram', name: 'Instagram', icon: '📷',
    dm: 'limited', dmDesc: '非关注者仅1条消息请求',
    comment: true, commentDesc: '帖子/Reels评论',
    strategy: '评论吸引→关注后私信',
  },
  {
    id: 'tiktok', name: 'TikTok', icon: '🎵',
    dm: 'limited', dmDesc: '取决于对方隐私设置',
    comment: true, commentDesc: '视频评论',
    strategy: '评论引流→互关后私信',
  },
  {
    id: 'youtube', name: 'YouTube', icon: '▶️',
    dm: 'no', dmDesc: '无私信功能',
    comment: true, commentDesc: '视频评论+置顶',
    strategy: '视频评论引流',
  },
  {
    id: 'x', name: 'X (Twitter)', icon: '𝕏',
    dm: 'conditional', dmDesc: '需对方关注你或开放私信',
    comment: true, commentDesc: '推文回复',
    strategy: '回复互动→互关后私信',
  },
  {
    id: 'linkedin', name: 'LinkedIn', icon: 'in',
    dm: 'no', dmDesc: '仅1度好友可私信',
    comment: true, commentDesc: '帖子评论',
    strategy: '发连接请求→通过后InMail',
  },
];

const DM_COLORS: Record<string, string> = {
  yes: '#10b981',
  limited: '#f59e0b',
  conditional: '#3b82f6',
  no: '#f87171',
};

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
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>Configure API keys, platform accounts, and outreach strategy</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { id: 'api', label: 'AI API' },
          { id: 'accounts', label: 'Platform Accounts' },
          { id: 'strategy', label: 'Platform Strategy' },
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

      {tab === 'strategy' && (
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Outreach Strategy Matrix</h3>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>各平台私信能力与评论策略。系统自动选择最优触达方式。</p>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            {PLATFORMS.map(p => {
              const acc = accounts.find(a => a.platform === p.id);
              return (
                <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 28 }}>{p.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      {acc && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#10b981' }}>Connected</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                      <span style={{ color: DM_COLORS[p.dm] }}>● DM: {p.dmDesc}</span>
                      <span style={{ color: p.comment ? '#10b981' : '#888' }}>● Comment: {p.commentDesc}</span>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '6px 10px', borderRadius: 6, display: 'inline-block' }}>
                      Strategy: {p.strategy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Daily DM limit: 50</label>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Daily comment limit: 30</label>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Hourly limit: 20</label>
            <label style={{ fontSize: 13, color: 'var(--text2)' }}>Random interval: 15-45 min</label>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
