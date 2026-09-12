'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n, LANGS } from '@/lib/i18n';

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, setLang, t } = useI18n();

  const NAV = [
    { href: '/dashboard', label: t('nav.dashboard'), icon: '📊' },
    { href: '/tasks', label: t('nav.tasks'), icon: '🔍' },
    { href: '/leads', label: t('nav.leads'), icon: '👥' },
    { href: '/messages', label: t('nav.messages'), icon: '💬' },
    { href: '/records', label: t('nav.records'), icon: '📈' },
    { href: '/settings', label: t('nav.settings'), icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ padding: '0 20px 20px' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {t('app.name')}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text2)' }}>{t('app.tagline')}</p>
      </div>

      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 8,
              marginBottom: 4,
              fontSize: 14,
              textDecoration: 'none',
              color: pathname.startsWith(item.href) ? '#fff' : 'var(--text2)',
              background: pathname.startsWith(item.href) ? 'rgba(99,102,241,0.15)' : 'transparent',
              fontWeight: pathname.startsWith(item.href) ? 600 : 400,
            }}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '0 12px' }}>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 10px',
            borderRadius: 8,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
            marginBottom: 12,
          }}
        >
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          borderRadius: 8,
          background: 'var(--surface2)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {userEmail[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail}</div>
            <div style={{ fontSize: 10, color: 'var(--text2)' }}>{t('common.free_plan')}</div>
          </div>
          <button onClick={handleLogout} title={t('nav.logout')} style={{
            background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 16,
          }}>↩</button>
        </div>
      </div>
    </aside>
  );
}
