'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877f2' },
  { id: 'reddit', name: 'Reddit', icon: '👽', color: '#ff4500' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#e4405f' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#ff0000' },
  { id: 'x', name: 'X (Twitter)', icon: '𝕏', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'in', color: '#0077b5' },
];

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ todaySent: 0, remaining: 50, activeAccounts: 0, totalLeads: 0 });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [showCookieFor, setShowCookieFor] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const loadData = () => {
    fetch('/api/dashboard').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/accounts').then(r => r.json()).then(setAccounts).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const connectAccount = async (platform: string) => {
    setConnecting(platform);
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform, cookies: cookies[platform] || 'auto' }),
    });
    setConnecting(null);
    setShowCookieFor(null);
    loadData();
  };

  const disconnectAccount = async (platform: string) => {
    await fetch('/api/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform }),
    });
    loadData();
  };

  const connectedCount = accounts.filter(a => a.status === 'connected').length;
  const needConnect = connectedCount === 0;

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{t('nav.dashboard')}</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>
        {needConnect ? '第一步：连接你的平台账号，然后开始获客' : `已连接 ${connectedCount} 个平台，开始创建任务吧`}
      </p>

      {needConnect && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          color: '#f59e0b', fontSize: 14,
        }}>
          ⚠️ 你还没有连接任何平台。请先连接至少一个平台，系统才能搜索用户并发送私信/评论。
        </div>
      )}

      {/* Platform connection cards */}
      <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>连接平台</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {PLATFORMS.map(p => {
          const acc = accounts.find(a => a.platform === p.id && a.status === 'connected');
          return (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 16,
              borderColor: acc ? 'rgba(16,185,129,0.4)' : 'var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: acc ? '#10b981' : 'var(--text2)' }}>
                    {acc ? '✓ 已连接' : '未连接'}
                  </div>
                </div>
              </div>
              {!acc && (
                <>
                  {showCookieFor === p.id ? (
                    <>
                      <textarea
                        placeholder="粘贴cookies或点快速连接..."
                        value={cookies[p.id] || ''}
                        onChange={e => setCookies({ ...cookies, [p.id]: e.target.value })}
                        style={{
                          width: '100%', height: 50, padding: 6, borderRadius: 6,
                          background: 'var(--surface2)', border: '1px solid var(--border)',
                          color: 'var(--text)', fontSize: 10, marginBottom: 6, boxSizing: 'border-box',
                        }}
                      />
                      <button onClick={() => connectAccount(p.id)} disabled={connecting === p.id}
                        style={{
                          width: '100%', padding: '6px', borderRadius: 6,
                          background: 'var(--gradient)', color: '#fff', border: 'none',
                          cursor: 'pointer', fontSize: 12, marginBottom: 4,
                        }}>
                        {connecting === p.id ? '...' : '确认连接'}
                      </button>
                      <button onClick={() => setShowCookieFor(null)}
                        style={{ width: '100%', padding: '4px', borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', fontSize: 11 }}>
                        取消
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setShowCookieFor(p.id)}
                      style={{
                        width: '100%', padding: '8px', borderRadius: 6,
                        background: 'var(--surface2)', border: '1px solid var(--border)',
                        color: 'var(--text)', cursor: 'pointer', fontSize: 12,
                      }}>
                      + 连接
                    </button>
                  )}
                </>
              )}
              {acc && (
                <button onClick={() => disconnectAccount(p.id)}
                  style={{
                    width: '100%', padding: '6px', borderRadius: 6,
                    background: 'transparent', border: '1px solid rgba(248,113,113,0.3)',
                    color: '#f87171', cursor: 'pointer', fontSize: 11,
                  }}>
                  断开
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>数据概览</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: t('dashboard.sent_today'), value: stats.todaySent, color: '#6366f1' },
          { label: t('dashboard.remaining'), value: stats.remaining, color: '#8b5cf6' },
          { label: t('dashboard.accounts'), value: stats.activeAccounts, color: '#10b981' },
          { label: t('dashboard.total_leads'), value: stats.totalLeads, color: '#f59e0b' },
        ].map(c => (
          <div key={c.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
            {needConnect ? '先连接平台开始' : '创建搜索任务，自动找客户'}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            {needConnect ? '连接至少一个平台后即可创建任务' : 'AI优化关键词，自动搜索真实用户，私信/评论触达'}
          </div>
        </div>
        <a href="/tasks" style={{
          padding: '12px 24px', borderRadius: 8, background: '#fff',
          color: '#6366f1', fontWeight: 700, textDecoration: 'none', fontSize: 14,
          pointerEvents: needConnect ? 'none' : 'auto',
          opacity: needConnect ? 0.5 : 1,
        }}>
          {needConnect ? '请先连接平台' : '+ 新建任务'}
        </a>
      </div>
    </DashboardLayout>
  );
}
