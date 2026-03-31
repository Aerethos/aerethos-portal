'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LIMIT = 100;

const FIELDS = [
  { key: 'standoutAchievement', label: 'Standout Achievement', hint: 'What are you most proud of from your time here?', placeholder: 'e.g. Playing my first Premier games for my club' },
  { key: 'bestMemory', label: 'Best Memory', hint: 'Your most unforgettable moment from school.', placeholder: 'e.g. Going to Barcelona in TY — the best trip overall' },
  { key: 'thisYear', label: 'This Year', hint: 'How would you sum up this year in one line?', placeholder: 'e.g. A lot of hard work, celebrated every win' },
  { key: 'next', label: 'Next', hint: 'What\'s coming next for you after school?', placeholder: 'e.g. Go to college in Waterford and get a degree' },
];

export default function StoryStep() {
  const router = useRouter();
  const [fields, setFields] = useState<Record<string, string>>({
    standoutAchievement: '',
    bestMemory: '',
    thisYear: '',
    next: '',
  });

  const update = (key: string, val: string) => setFields(f => ({ ...f, [key]: val }));
  const allFilled = Object.values(fields).every(v => v.trim().length > 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>Dashboard</a>
      </header>

      <div style={{ paddingTop: 64 }}>
        <div className="progress-strip">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Step 5 of 6</span>
              <span className="progress-name">Your Story</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '83.3%' }}/></div>
          </div>
        </div>
      </div>

      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 05</span></div>
          <h1 className="ae-h1">Tell your<br/><em>story.</em></h1>
          <p className="ae-lead">Four short fields that capture your journey. Keep it concise and authentic — these appear on your yearbook page exactly as written.</p>

          {FIELDS.map((f, i) => (
            <div key={f.key} style={{ marginBottom: i < FIELDS.length - 1 ? 32 : 0 }}>
              <label className="ae-label">{f.label} <span style={{ color: '#c53030' }}>*</span></label>
              <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.45, marginBottom: 10, fontStyle: 'italic' }}>{f.hint}</div>
              <textarea
                className="ae-textarea"
                value={fields[f.key]}
                onChange={e => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                rows={2}
                maxLength={LIMIT}
              />
              <div className={`ae-char-count ${LIMIT - fields[f.key].length < 15 ? 'warning' : ''}`}>
                {LIMIT - fields[f.key].length} characters remaining
              </div>
              {i < FIELDS.length - 1 && <div className="ae-divider"/>}
            </div>
          ))}

          <div className="ae-notice" style={{ marginTop: 36, marginBottom: 0 }}>
            <div className="ae-notice-body">Keep it concise and honest. These sections capture the essence of your year in short, memorable snippets — they&apos;re printed exactly as you write them.</div>
          </div>

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/quote')}>← Back</button>
            <button className="ae-btn-primary" onClick={() => router.push('/portal/submit/top-tracks')} disabled={!allFilled}>
              <span>Next: Top Tracks →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
