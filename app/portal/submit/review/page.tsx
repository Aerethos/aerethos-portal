'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const checks = [
  { label: 'Profile Photo', detail: 'Uploaded & verified', status: 'complete' as const },
  { label: 'Page Colour', detail: 'Ocean Blue selected', status: 'complete' as const },
  { label: 'Memory Photos', detail: '14 photos uploaded', status: 'complete' as const },
  { label: 'Personal Quote', detail: 'Saved', status: 'complete' as const },
  { label: 'Standout Achievement', detail: 'Saved', status: 'complete' as const },
  { label: 'Best Memory', detail: 'Saved', status: 'complete' as const },
  { label: 'This Year', detail: 'Saved', status: 'complete' as const },
  { label: 'Next', detail: 'Saved', status: 'complete' as const },
  { label: 'Top Tracks', detail: '2 songs confirmed', status: 'complete' as const },
];

const editLinks = [
  { label: 'Edit Photo', href: '/portal/submit/profile-photo' },
  { label: 'Edit Colour', href: '/portal/submit/backdrop-color' },
  { label: 'Edit Photos', href: '/portal/submit/memory-photos' },
  { label: 'Edit Quote', href: '/portal/submit/quote' },
  { label: 'Edit Story', href: '/portal/submit/story' },
  { label: 'Edit Tracks', href: '/portal/submit/top-tracks' },
];

export default function ReviewStep() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const allConfirmed = confirmed.every(Boolean);

  const confirmItems = [
    "I've cropped all my photos — no black borders",
    "I haven't uploaded any screenshots",
    "My profile photo is high quality and portrait-oriented",
    "I'm happy with all my text and song choices",
  ];

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => router.push('/portal/dashboard'), 1200);
  };

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
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Review & Submit</span>
              <span className="progress-name">Almost done</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '100%' }}/></div>
          </div>
        </div>
      </div>

      <div className="portal-content-wide">

        <div className="fade-up" style={{ marginBottom: 24 }}>
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Final Step</span></div>
          <h1 className="ae-h1">Review your<br/><em>submission.</em></h1>
          <p className="ae-lead">Check everything looks correct before submitting. Once submitted you can still edit until the deadline.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* Checklist + preview */}
          <div>
            <div className="ae-card fade-up-1" style={{ marginBottom: 16 }}>
              <div className="ae-eyebrow" style={{ marginBottom: 20 }}>
                <div className="ae-eyebrow-line"/>
                <span className="ae-eyebrow-text">Submission Checklist</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {checks.map((c, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: i < checks.length - 2 ? '1px solid rgba(0,53,102,0.06)' : 'none',
                    gridColumn: i % 2 === 0 ? '1' : '2',
                  }}>
                    <div className="ae-check-dot complete" style={{ marginTop: 4 }}/>
                    <div>
                      <div className="ae-check-label">{c.label}</div>
                      {c.detail && <div className="ae-check-detail">{c.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit shortcuts */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,53,102,0.07)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Edit sections</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {editLinks.map(l => (
                    <button key={l.href} className="ae-btn-ghost" onClick={() => router.push(l.href)} style={{ fontSize: 10 }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview placeholder */}
            <div className="ae-card-sm fade-up-2" style={{ textAlign: 'center', padding: '40px 32px', background: 'var(--navy-deep)', border: '1px solid rgba(176,138,74,0.12)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, color: 'var(--gold)', opacity: 0.3, marginBottom: 12 }}>◎</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: 'var(--cream)', marginBottom: 8 }}>Live Preview Coming Soon</div>
              <div style={{ fontSize: 12, color: 'var(--cream)', opacity: 0.35, lineHeight: 1.6 }}>
                In the live version, you&apos;ll see your exact yearbook page layout here before submitting.
              </div>
            </div>
          </div>

          {/* Final confirm + submit */}
          <div>
            <div className="ae-card fade-up-2">
              <div className="ae-eyebrow" style={{ marginBottom: 20 }}>
                <div className="ae-eyebrow-line"/>
                <span className="ae-eyebrow-text">Final Check</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 28 }}>
                {confirmItems.map((item, i) => (
                  <label key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: i < confirmItems.length - 1 ? '1px solid rgba(0,53,102,0.06)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: 18, height: 18,
                      border: `1.5px solid ${confirmed[i] ? 'var(--gold)' : 'rgba(0,53,102,0.2)'}`,
                      background: confirmed[i] ? 'var(--gold)' : 'transparent',
                      flexShrink: 0,
                      marginTop: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                      cursor: 'pointer',
                    }} onClick={() => setConfirmed(c => c.map((v, j) => j === i ? !v : v))}>
                      {confirmed[i] && <span style={{ color: 'var(--navy-deep)', fontSize: 12, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.7, lineHeight: 1.5 }}>{item}</span>
                  </label>
                ))}
              </div>

              <div className="ae-notice" style={{ marginBottom: 24 }}>
                <div className="ae-notice-body" style={{ fontSize: 12 }}>Once submitted, you can still edit until <strong>May 15, 2027</strong>. AerEthos will then design your page and send you a proof.</div>
              </div>

              <button
                className="ae-btn-primary"
                style={{ width: '100%', padding: '20px', fontSize: 12 }}
                onClick={handleSubmit}
                disabled={!allConfirmed || submitting}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {submitting && <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(0,16,32,0.2)',
                    borderTopColor: 'var(--navy-deep)',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }}/>}
                  {submitting ? 'Submitting...' : 'Submit to AerEthos →'}
                </span>
              </button>

              {!allConfirmed && (
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--blue)', opacity: 0.4, textAlign: 'center', fontStyle: 'italic' }}>
                  Tick all boxes above to submit.
                </div>
              )}
            </div>

            <div style={{ marginTop: 16, padding: '16px 20px', borderLeft: '2px solid rgba(0,53,102,0.12)' }}>
              <div style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.5, lineHeight: 1.6 }}>
                Questions? Email <a href="mailto:nathan@aerethos.com" style={{ color: 'var(--gold)', textDecoration: 'none' }}>nathan@aerethos.com</a>
              </div>
            </div>
          </div>

        </div>

        <div style={{ marginTop: 32 }}>
          <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/top-tracks')}>← Back to Top Tracks</button>
        </div>
      </div>
    </div>
  );
}
