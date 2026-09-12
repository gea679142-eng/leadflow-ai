'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';

const PLATFORMS = ['facebook', 'reddit', 'instagram', 'tiktok', 'youtube', 'x', 'linkedin'];

const STRATEGIES = [
  { id: 'auto', label: 'Auto (Recommended)', desc: 'System picks best: DM where possible, comment where limited' },
  { id: 'dm', label: 'DM Only', desc: 'Only send direct messages (bypass if limited)' },
  { id: 'comment', label: 'Comment Only', desc: 'Only comment on posts (safer, no DM limit issues)' },
  { id: 'both', label: 'DM + Comment', desc: 'Comment first, then DM after engagement' },
];

export default function TasksPage() {
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

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Search Tasks</h1>
          <p style={{ color: 'var(--text2)', margin: '4px 0 0' }}>Create lead search + outreach tasks</p>
        </div>
        <button onClick={() => setShowModal(true)}
          style={{ padding: '10px 20px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {tasks.map(t => (
          <div key={t.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ margin: 0 }}>{t.name}</h3>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>{t.status}</span>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: 13, margin: '0 0 12' }}>{t.keywords}</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
              {t.platforms?.map((p: string) => (
                <span key={p} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text2)' }}>{p}</span>
              ))}
            </div>
            <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${t.progress}%`, background: 'var(--gradient)', borderRadius: 3 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)' }}>
              <span>{t.discovered} found</span>
              <span>{t.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, width: 500, maxWidth: '90%' }}>
            <h2 style={{ marginTop: 0 }}>New Outreach Task</h2>
            {step === 1 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>Task Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. SaaS Leads"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '6px 0 16px' }} />
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>Keywords / Topic ({form.keywords.length}/1000)</label>
                <textarea value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value.slice(0, 1000)})}
                  placeholder="Describe your target audience... e.g. SaaS founders looking for growth tools"
                  style={{ width: '100%', height: 100, padding: '10px 14px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', margin: '6px 0 16px', resize: 'vertical' }} />
              </>
            )}
            {step === 2 && (
              <>
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>Select Platforms</label>
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
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>Outreach Strategy</label>
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
                <label style={{ fontSize: 13, color: 'var(--text2)' }}>Target Leads: {form.targetCount}</label>
                <input type="range" min="10" max="500" value={form.targetCount}
                  onChange={e => setForm({...form, targetCount: Number(e.target.value)})}
                  style={{ width: '100%', margin: '12px 0 20px' }} />
              </>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {step > 1 && <button onClick={() => setStep(step - 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Back</button>}
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}>Cancel</button>
              {step < 4 ? (
                <button onClick={() => setStep(step + 1)} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>Next</button>
              ) : (
                <button onClick={createTask} style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--gradient)', color: '#fff', border: 'none', cursor: 'pointer' }}>Create</button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
