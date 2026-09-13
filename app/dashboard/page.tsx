'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/lib/i18n';
import { useEffect, useRef, useState } from 'react';

const PLATFORMS = [
  {
    id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877f2',
    steps: [
      '在Chrome中打开 facebook.com 并登录你的账号',
      '按 F12 打开开发者工具 → 点击 Application（应用）',
      '左侧展开 Cookies → 选择 https://www.facebook.com',
      '找到 c_user 和 xs 两个cookie的值，复制完整cookies字符串',
      '粘贴到下方输入框，点击验证连接',
    ],
  },
  {
    id: 'reddit', name: 'Reddit', icon: '👽', color: '#ff4500',
    steps: [
      '在Chrome中打开 reddit.com 并登录',
      '按 F12 → Application → Cookies → https://www.reddit.com',
      '复制所有cookie值（特别是 session 和 token）',
      '粘贴到下方，系统会自动验证你的Reddit用户名',
    ],
  },
  {
    id: 'instagram', name: 'Instagram', icon: '📷', color: '#e4405f',
    steps: [
      '在Chrome中打开 instagram.com 并登录',
      '按 F12 → Application → Cookies → https://www.instagram.com',
      '找到 sessionid cookie，复制完整cookies字符串',
      '粘贴到下方验证',
    ],
  },
  {
    id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000',
    steps: [
      '在Chrome中打开 tiktok.com 并登录',
      '按 F12 → Application → Cookies → https://www.tiktok.com',
      '找到 sessionid cookie，复制完整cookies字符串',
      '粘贴到下方验证',
    ],
  },
  {
    id: 'youtube', name: 'YouTube', icon: '▶️', color: '#ff0000',
    steps: [
      '在Chrome中打开 youtube.com 并登录Google账号',
      '按 F12 → Application → Cookies → https://www.youtube.com',
      '复制所有Google cookies（SID、HSID等）',
      '粘贴到下方验证',
    ],
  },
  {
    id: 'x', name: 'X (Twitter)', icon: '𝕏', color: '#000000',
    steps: [
      '在Chrome中打开 x.com 并登录',
      '按 F12 → Application → Cookies → https://x.com',
      '找到 auth_token 和 ct0 两个cookie',
      '复制完整cookies字符串粘贴到下方',
    ],
  },
  {
    id: 'linkedin', name: 'LinkedIn', icon: 'in', color: '#0077b5',
    steps: [
      '在Chrome中打开 linkedin.com 并登录',
      '按 F12 → Application → Cookies → https://www.linkedin.com',
      '找到 li_at 和 JSESSIONID cookie',
      '复制完整cookies字符串粘贴到下方',
    ],
  },
];

export default function DashboardPage() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ todaySent: 0, remaining: 50, activeAccounts: 0, totalLeads: 0 });
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [cookieInput, setCookieInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');
  const [connMsg, setConnMsg] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected')) {
      setConnMsg(`✅ ${params.get('connected')} 连接成功！`);
      window.history.replaceState({}, '', '/dashboard');
    } else if (params.get('connect_error')) {
      setConnMsg('❌ 连接失败：请确保你在已登录的社媒页面点击书签');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const loadData = () => {
    fetch('/api/dashboard').then(r => r.json()).then(setStats).catch(() => {});
    fetch('/api/accounts').then(r => r.json()).then(setAccounts).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const connectAccount = async () => {
    if (!selectedPlatform) return;
    setConnecting(true);
    setError('');
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: selectedPlatform, cookies: cookieInput.trim() || 'auto' }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '连接失败');
      } else {
        setSelectedPlatform(null);
        setCookieInput('');
        loadData();
      }
    } catch (e: any) {
      setError('网络错误，请重试');
    }
    setConnecting(false);
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
  const selected = PLATFORMS.find(p => p.id === selectedPlatform);

  const bookmarkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (bookmarkRef.current) {
      const origin = window.location.origin;
      bookmarkRef.current.href = `javascript:(function(){var h=location.host;var p='${selectedPlatform || 'facebook'}';if(h.includes('facebook'))p='facebook';else if(h.includes('reddit'))p='reddit';else if(h.includes('instagram'))p='instagram';else if(h.includes('tiktok'))p='tiktok';else if(h.includes('youtube'))p='youtube';else if(h.includes('twitter')||h.includes('x.com'))p='x';else if(h.includes('linkedin'))p='linkedin';location.href='https://leadflow-ai-z2rf.onrender.com/api/accounts/callback?platform='+p+'&cookies='+encodeURIComponent(document.cookie);})()`;
    }
  }, [selectedPlatform]);

  return (
    <DashboardLayout>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>{t('nav.dashboard')}</h1>
      <p style={{ color: 'var(--text2)', margin: '0 0 24px' }}>
        {needConnect ? '第一步：连接你的社交平台账号，然后开始获客' : `已连接 ${connectedCount} 个平台，可以创建任务了`}
      </p>

      {connMsg && (
        <div style={{
          background: connMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${connMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          color: connMsg.startsWith('✅') ? '#10b981' : '#f87171', fontSize: 14,
        }}>
          {connMsg}
        </div>
      )}

      {needConnect && (
        <div style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          color: '#f59e0b', fontSize: 14,
        }}>
          ⚠️ 你还没有连接任何平台。请先连接至少一个平台，系统才能搜索用户并发送私信/评论。
        </div>
      )}

      <h3 style={{ fontSize: 16, margin: '0 0 12px' }}>连接平台</h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', margin: '0 0 16px' }}>
        连接方式：在浏览器登录对应平台后，按F12复制cookies粘贴进来。系统会验证cookies有效性。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 24 }}>
        {PLATFORMS.map(p => {
          const acc = accounts.find(a => a.platform === p.id && a.status === 'connected');
          return (
            <div key={p.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: 16,
              borderColor: acc ? 'rgba(16,185,129,0.4)' : 'var(--border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${p.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: acc ? '#10b981' : 'var(--text2)' }}>
                    {acc ? `✓ ${acc.username}` : '未连接'}
                  </div>
                </div>
              </div>
              {!acc && (
                <button onClick={() => { setSelectedPlatform(p.id); setError(''); setCookieInput(''); }}
                  style={{
                    width: '100%', padding: '8px', borderRadius: 6,
                    background: 'var(--gradient)', color: '#fff', border: 'none',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  }}>
                  + 连接 {p.name}
                </button>
              )}
              {acc && (
                <button onClick={() => disconnectAccount(p.id)}
                  style={{
                    width: '100%', padding: '6px', borderRadius: 6,
                    background: 'transparent', border: '1px solid rgba(248,113,113,0.3)',
                    color: '#f87171', cursor: 'pointer', fontSize: 11,
                  }}>
                  断开连接
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Connection modal - super simple 2-step */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }} onClick={() => setSelectedPlatform(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', borderRadius: 16, padding: 28,
            width: 560, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto',
          }}>
            <h2 style={{ margin: '0 0 20px' }}>{selected.icon} 连接 {selected.name}</h2>

            {/* Step 1 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0, fontSize: 14,
              }}>1</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>打开{selected.name}并登录</div>
                <a
                  href={`https://${selected.id === 'x' ? 'x.com' : selected.id === 'youtube' ? 'youtube.com' : selected.id + '.com'}`}
                  target="_blank"
                  style={{
                    display: 'inline-block', padding: '10px 20px', borderRadius: 8,
                    background: selected.color, color: '#fff', textDecoration: 'none',
                    fontWeight: 600, fontSize: 14,
                  }}
                >
                  打开 {selected.name} →
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0, fontSize: 14,
              }}>2</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>在{selected.name}页面按F12，点Console，粘贴这行代码回车</div>
                <div style={{
                  background: 'var(--surface2)', borderRadius: 8, padding: '10px 14px',
                  fontFamily: 'monospace', fontSize: 13, color: '#6366f1',
                  marginBottom: 8, cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
                onClick={() => { navigator.clipboard?.writeText('copy(document.cookie)'); }}
                title="点击复制">
                  copy(document.cookie)
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  点击代码自动复制，然后粘贴到Console按回车（会自动复制cookies）
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0, fontSize: 14,
              }}>3</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>回到这里粘贴cookies（Ctrl+V），点连接</div>
                <textarea
                  placeholder="在这里粘贴 (Ctrl+V)..."
                  value={cookieInput}
                  onChange={e => setCookieInput(e.target.value)}
                  style={{
                    width: '100%', height: 70, padding: 10, borderRadius: 8,
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    color: 'var(--text)', fontSize: 12, boxSizing: 'border-box',
                    fontFamily: 'monospace',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 8, padding: '10px 14px', color: '#f87171', fontSize: 13, marginBottom: 12,
              }}>
                ✗ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedPlatform(null)}
                style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer' }}>
                取消
              </button>
              <button onClick={connectAccount} disabled={connecting || !cookieInput.trim()}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: cookieInput.trim() ? 'pointer' : 'not-allowed', fontWeight: 600, opacity: cookieInput.trim() ? 1 : 0.5 }}>
                {connecting ? '连接中...' : '连接'}
              </button>
            </div>
          </div>
        </div>
      )}

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
