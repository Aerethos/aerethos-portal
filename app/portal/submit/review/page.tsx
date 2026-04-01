'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/portal-context';
import { supabase } from '@/lib/supabase';

const confirmItems = [
  "I've cropped all my photos — no black borders",
  "I haven't uploaded any screenshots",
  "My profile photo is high quality and portrait-oriented",
  "I'm happy with all my text and song choices",
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
  const { form, submitAll, saving } = usePortal();
  const [confirmed, setConfirmed] = useState<boolean[]>([false, false, false, false]);
  const [submitting, setSubmitting] = useState(false);
  const [deadline, setDeadline] = useState('the deadline');
  const allConfirmed = confirmed.every(Boolean);

  useEffect(() => {
    async function loadDeadline() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('students')
        .select('schools(deadline)')
        .eq('id', session.user.id)
        .single();
      if (data?.schools) {
        const d = new Date((data.schools as { deadline: string }).deadline);
        setDeadline(d.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' }));
      }
    }
    loadDeadline();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ok = await submitAll();
      if (ok) {
        router.push('/portal/dashboard');
      } else {
        alert('Something went wrong. Please try again or contact nathan@aerethos.com');
        setSubmitting(false);
      }
    } catch {
      alert('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const checks = [
    { label: 'Profile Photo', detail: form.profilePhotoUrl ? '✓ Uploaded' : '— Missing', ok: !!form.profilePhotoUrl },
    { label: 'Backdrop Colour', detail: form.backdropColorName || '— Missing', ok: !!form.backdropColorHex },
    { label: 'Memory Photos', detail: `${form.memoryPhotos?.length ?? 0} photos uploaded`, ok: (form.memoryPhotos?.length ?? 0) >= 10 },
    { label: 'Personal Quote', detail: form.quote ? `"${form.quote.slice(0, 40)}${form.quote.length > 40 ? '...' : ''}"` : '— Missing', ok: !!form.quote },
    { label: 'Standout Achievement', detail: form.storyAchievement || '— Missing', ok: !!form.storyAchievement },
    { label: 'Best Memory', detail: form.storyBestMemory || '— Missing', ok: !!form.storyBestMemory },
    { label: 'This Year', detail: form.storyThisYear || '— Missing', ok: !!form.storyThisYear },
    { label: 'Next', detail: form.storyNext || '— Missing', ok: !!form.storyNext },
    { label: 'Track 1', detail: form.track1 ? `${form.track1.title} — ${form.track1.artist}` : '— Missing', ok: !!form.track1 },
    { label: 'Track 2', detail: form.track2 ? `${form.track2.title} — ${form.track2.artist}` : '— Missing', ok: !!form.track2 },
  ];

  const missingFields = checks.filter(c => !c.ok);
  const canSubmit = missingFields.length === 0 && allConfirmed;

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
          <p className="ae-lead">Check everything looks correct before submitting.</p>
        </div>

        {/* Missing fields warning */}
        {missingFields.length > 0 && (
          <div className="ae-notice warning fade-up" style={{ marginBottom: 24 }}>
            <div className="ae-notice-title">Missing Sections</div>
            <div className="ae-notice-body">
              You still need to complete: {missingFields.map(f => f.label).join(', ')}.
              Go back and fill these in before submitting.
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>

          {/* Checklist */}
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
                    <div className={`ae-check-dot ${c.ok ? 'complete' : 'incomplete'}`} style={{ marginTop: 4, flexShrink: 0 }}/>
                    <div>
                      <div className="ae-check-label">{c.label}</div>
                      <div className="ae-check-detail" style={{ color: c.ok ? undefined : '#c53030' }}>{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit shortcuts */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(0,53,102,0.07)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Edit sections</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {editLinks.map(l => (
                    <button key={l.href} className="ae-btn-ghost" onClick={() => router.push(l.href)} style={{ fontSize: 10 }}>{l.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile photo preview */}
            {form.profilePhotoUrl && (
              <div className="ae-card-sm fade-up-2" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Profile Photo Preview</div>
                <img src={form.profilePhotoUrl} alt="Profile" style={{ maxHeight: 160, display: 'block', objectFit: 'cover' }}/>
              </div>
            )}
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
                  <label key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < confirmItems.length - 1 ? '1px solid rgba(0,53,102,0.06)' : 'none', cursor: 'pointer' }}>
                    <div style={{
                      width: 18, height: 18,
                      border: `1.5px solid ${confirmed[i] ? 'var(--gold)' : 'rgba(0,53,102,0.2)'}`,
                      background: confirmed[i] ? 'var(--gold)' : 'transparent',
                      flexShrink: 0, marginTop: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s', cursor: 'pointer',
                    }} onClick={() => setConfirmed(c => c.map((v, j) => j === i ? !v : v))}>
                      {confirmed[i] && <span style={{ color: 'var(--navy-deep)', fontSize: 12, lineHeight: 1 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.7, lineHeight: 1.5 }}>{item}</span>
                  </label>
                ))}
              </div>

              <div className="ae-notice" style={{ marginBottom: 24 }}>
                <div className="ae-notice-body" style={{ fontSize: 12 }}>
                  Once submitted, you can still edit until <strong>{deadline}</strong>. AerEthos will then design your page and send you a proof to review.
                </div>
              </div>

              <button
                className="ae-btn-primary"
                style={{ width: '100%', padding: '20px', fontSize: 12 }}
                onClick={handleSubmit}
                disabled={!canSubmit || submitting || saving}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {(submitting || saving) && (
                    <span style={{ width: 14, height: 14, border: '2px solid rgba(0,16,32,0.2)', borderTopColor: 'var(--navy-deep)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>
                  )}
                  {submitting ? 'Submitting...' : saving ? 'Saving...' : 'Submit to AerEthos →'}
                </span>
              </button>

              {!allConfirmed && (
                <div style={{ marginTop: 12, fontSize: 11, color: 'var(--blue)', opacity: 0.4, textAlign: 'center', fontStyle: 'italic' }}>
                  Tick all boxes above to submit.
                </div>
              )}
              {allConfirmed && missingFields.length > 0 && (
                <div style={{ marginTop: 12, fontSize: 11, color: '#c53030', textAlign: 'center' }}>
                  Complete all sections before submitting.
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
