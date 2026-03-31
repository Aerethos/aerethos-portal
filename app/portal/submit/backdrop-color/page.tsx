'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [selected, setSelected] = useState(COLORS[0]);

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
          <p className="ae-lead">This colour appears behind your portrait on your yearbook page. Choose something that reflects your personality.</p>

          {/* Colour grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 36 }}>
            {COLORS.map(color => (
              <button
                key={color.hex}
                onClick={() => setSelected(color)}
                className={`color-swatch ${selected.hex === color.hex ? 'selected' : ''}`}
                style={{ backgroundColor: color.hex, border: 'none', cursor: 'pointer', aspectRatio: '1', position: 'relative' }}
              >
                {selected.hex === color.hex && (
                  <div className="color-swatch-check">✓</div>
                )}
                <div className="color-swatch-name">{color.name}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{
            padding: '32px',
            background: 'rgba(0,53,102,0.03)',
            border: '1px solid rgba(0,53,102,0.07)',
            marginBottom: 36,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Preview</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                backgroundColor: selected.hex,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 16px 40px ${selected.hex}55`,
                transition: 'background-color 0.3s, box-shadow 0.3s',
              }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.06em' }}>Your Photo</span>
              </div>
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--blue)', opacity: 0.55 }}>
              Selected: <strong style={{ fontWeight: 500, opacity: 1 }}>{selected.name}</strong>
            </div>
          </div>

          <div className="ae-notice" style={{ marginBottom: 36 }}>
            <div className="ae-notice-body">This colour will be the signature accent on your yearbook page — it&apos;s used for your name ring and background. Choose something that feels like you.</div>
          </div>

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/profile-photo')}>← Back</button>
            <button className="ae-btn-primary" onClick={() => router.push('/portal/submit/memory-photos')}>
              <span>Next: Memory Photos →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
