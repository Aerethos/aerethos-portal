'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/portal-context';

const COLORS = [
  { name: 'Ocean Blue',    hex: '#4A7BA7' },
  { name: 'Forest Green', hex: '#2D5F3F' },
  { name: 'Deep Purple',  hex: '#5B3A7D' },
  { name: 'Sunset',       hex: '#D97742' },
  { name: 'Cherry',       hex: '#A73B3B' },
  { name: 'Slate',        hex: '#546E7A' },
  { name: 'Teal',         hex: '#1D8B8B' },
  { name: 'Navy',         hex: '#2C3E50' },
  { name: 'Burgundy',     hex: '#7D3C4A' },
  { name: 'Mustard',      hex: '#D4A655' },
  { name: 'Emerald',      hex: '#27AE60' },
  { name: 'Charcoal',     hex: '#3D3D3D' },
];

export default function BackdropColorStep() {
  const router = useRouter();
  const { form, updateForm, saveStep, saving } = usePortal();
  const [selected, setSelected] = useState(
    COLORS.find(c => c.hex === form.backdropColorHex) ?? COLORS[0]
  );

  const handleNext = async () => {
    updateForm({ backdropColorHex: selected.hex, backdropColorName: selected.name });
    await saveStep({
      backdrop_color_hex: selected.hex,
      backdrop_color_name: selected.name,
    });
    router.push('/portal/submit/memory-photos');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>
          {saving ? 'Saving...' : 'Dashboard'}
        </a>
      </header>
      <div style={{ paddingTop: 64 }}>
        <div className="progress-strip">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Step 2 of 6</span>
              <span className="progress-name">Backdrop Colour</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '33.3%' }}/></div>
          </div>
        </div>
      </div>
      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 02</span></div>
          <h1 className="ae-h1">Choose your<br/><em>backdrop colour.</em></h1>
          <p className="ae-lead">This colour appears behind your portrait on your yearbook page.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 36 }}>
            {COLORS.map(color => (
              <button key={color.hex} onClick={() => setSelected(color)}
                style={{ backgroundColor: color.hex, border: 'none', cursor: 'pointer', aspectRatio: '1', position: 'relative',
                  outline: selected.hex === color.hex ? '2px solid var(--gold)' : 'none', outlineOffset: 3 }}>
                {selected.hex === color.hex && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}>✓</div>
                )}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.45))', fontSize: 10, color: 'white', fontFamily: "'DM Sans', sans-serif" }}>{color.name}</div>
              </button>
            ))}
          </div>
          <div style={{ padding: '32px', background: 'rgba(0,53,102,0.03)', border: '1px solid rgba(0,53,102,0.07)', marginBottom: 36, textAlign: 'center' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Preview</div>
            <div style={{ width: 120, height: 120, borderRadius: '50%', backgroundColor: selected.hex, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 16px 40px ${selected.hex}55`, transition: 'background-color 0.3s' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif" }}>Your Photo</span>
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--blue)', opacity: 0.55 }}>Selected: <strong style={{ fontWeight: 500 }}>{selected.name}</strong></div>
          </div>
          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/profile-photo')}>← Back</button>
            <button className="ae-btn-primary" onClick={handleNext} disabled={saving}>
              <span>{saving ? 'Saving...' : 'Next: Memory Photos →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
