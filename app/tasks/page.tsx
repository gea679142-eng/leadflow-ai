'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useI18n } from '@/lib/i18n';
import { useState, useEffect } from 'react';

const PLATFORMS = ['facebook', 'reddit', 'instagram', 'tiktok', 'youtube', 'x', 'linkedin'];

export default function TasksPage() {
  const { t } = useI18n();
  const [tasks, setTasks] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', keywords: '', platforms: [] as string[], targetCount: 100, strategy: 'auto' });

  const loadTasks = () => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
      .catch(() => {});
  };

  useEffect(() => { loadTasks(); }, []);

  const createTask = async () => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setStep(1);
      setForm({ name: '', keywords: '', platforms: [], targetCount: 100, strategy: 'auto' });
      loadTasks();
    }
  };

  const STRATEGIES = [
    { id: 'auto', label: t('tasks.strategy_auto'), desc: t('tasks.strategy_auto_desc') },
    { id: 'dm', label: t('tasks.strategy_dm'), desc: t('tasks.strategy_dm_desc') },
    { id: 'comment', label: t('tasks.strategy_comment'), desc: t('tasks.strategy_comment_desc') },
    { id: 'both', label: t('tasks.strategy_both'), desc: t('tasks.strategy_both_desc') },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{t('tasks.title')}</h1>
          <p style={{ color: 'var(--text2)', margin: '4px 0 0' }}>{t('tasks.subtitle')}</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          {t('tasks.new')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {tasks.map(task => (
          <div key={task.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{task.name}</h3>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{task.status}</span>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 12' }}>{task.keywords}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {task.platforms?.map((p: string) => (
                <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text2)' }}>{p}</span>
              ))}
            </div>
            <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${task.progress}%`, background: 'var(--gradient)', borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
              <span>{task.discovered} {t('tasks.found')}</span>
              <span>{task.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, width: 500, maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>{t('tasks.new')}</h2>
            {step === 1 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>{t('tasks.name')}</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. SaaS Leads"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '6px 0 16px' }} />
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>{t('tasks.keywords')} ({form.keywords.length}/1000)</label>
                <textarea value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value.slice(0, 1000)})}
                  placeholder={t('tasks.keywords_ph')}
                  style={{ width: '100%', height: 100, padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '6px 0 16px', resize: 'vertical' }} />
              </>
            )}
            {step === 2 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>{t('tasks.platforms')} ({form.platforms.length})</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '12px 0 20px' }}>
                  {PLATFORMS.map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', borderRadius: 8, background: form.platforms.includes(p) ? 'rgba(99,102,241,0.2)' : 'var(--surface2)', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.platforms.includes(p)}
                        onChange={e => {
                          const ps = e.target.checked ? [...form.platforms, p] : form.platforms.filter(x => x !== p);
                          setForm({...form, platforms: ps});
                        }} />
                      {p}
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>{t('tasks.strategy')}</label>
                <div style={{ display: 'grid', gap: 8, margin: '12px 0 20px' }}>
                  {STRATEGIES.map(s => (
                    <label key={s.id} style={{ display: 'flex', gap: 12, padding: '12px', borderRadius: 8, background: form.strategy === s.id ? 'rgba(99,102,241,0.2)' : 'var(--surface2)', cursor: 'pointer' }}>
                      <input type="radio" name="strategy" checked={form.strategy === s.id} onChange={() => setForm({...form, strategy: s.id})} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>{t('tasks.target')}: {form.targetCount}</label>
                <input type="range" min="10" max="500" value={form.targetCount}
                  onChange={e => setForm({...form, targetCount: Number(e.target.value)})}
                  style={{ width: '100%', margin: '12px 0 20px' }} />
              </>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {step > 1 && <button onClick={() => setStep(step - 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>{t('tasks.back')}</button>}
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>{t('tasks.cancel')}</button>
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>{t('tasks.next')}</button>
              ) : (
                <button onClick={createTask} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>{t('tasks.create')}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
