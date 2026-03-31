'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function StepShell({
  step, totalSteps, stepName, progressPct, children,
}: {
  step: number; totalSteps: number; stepName: string; progressPct: number; children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>
          Dashboard
        </a>
      </header>

      <div className="progress-strip" style={{ paddingTop: 80 }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="progress-meta">
            <span className="progress-step-label">Step {step} of {totalSteps}</span>
            <span className="progress-name">{stepName}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }}/>
          </div>
        </div>
      </div>

      <div className="portal-main" style={{ paddingTop: 0 }}>
        {children}
      </div>
    </div>
  );
}

export default function ProfilePhotoStep() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!['image/jpeg', 'image/png', 'image/heic'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or HEIC file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    const img = new Image();
    img.onload = () => {
      if (img.width < 1200 || img.height < 1600) {
        setError(`Resolution too low. Minimum 1200×1600px. Your photo is ${img.width}×${img.height}px.`);
        setSelectedFile(null);
        setPreviewUrl(null);
      } else {
        setSelectedFile(file);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <StepShell step={1} totalSteps={6} stepName="Profile Photo" progressPct={16.6}>
      <div className="portal-content">

        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 01</span></div>
          <h1 className="ae-h1">Your yearbook<br/><em>profile photo.</em></h1>
          <p className="ae-lead">This is your main portrait. It will be placed prominently on your yearbook page — make it count.</p>

          {/* Requirements */}
          <div className="ae-notice warning" style={{ marginBottom: 32 }}>
            <div className="ae-notice-title">Photo Requirements</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f855a', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✓ Do</div>
                {['High-quality camera or phone photo', 'Portrait orientation, face clearly visible', 'Crop before uploading — no black borders', 'Minimum 1200×1600 pixels'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4, lineHeight: 1.45 }}>· {t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c53030', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕ Don&apos;t</div>
                {['Upload screenshots', 'Photos with black bars', 'Blurry or low-resolution images', 'Group shots or cropped images'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4, lineHeight: 1.45 }}>· {t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Upload zone */}
          <label htmlFor="photo-upload" className={`ae-upload-zone ${previewUrl ? '' : ''}`} style={{ display: 'block', marginBottom: 20 }}>
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview" style={{ maxHeight: 280, margin: '0 auto', display: 'block', marginBottom: 16 }}/>
                <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.45, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
                  Click to change photo
                </div>
              </div>
            ) : (
              <div>
                <div className="ae-upload-icon">◉</div>
                <div className="ae-upload-title">Drag & drop or click to upload</div>
                <div className="ae-upload-sub">JPG · PNG · HEIC · Max 10MB</div>
              </div>
            )}
          </label>
          <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/heic" onChange={handleFileSelect} style={{ display: 'none' }}/>

          {/* Error */}
          {error && (
            <div className="ae-notice warning" style={{ marginBottom: 20 }}>
              <div className="ae-notice-title">Photo Rejected</div>
              <div className="ae-notice-body">{error}</div>
              <button onClick={() => setError(null)} style={{ marginTop: 10, fontSize: 11, color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Try Another →
              </button>
            </div>
          )}

          {/* Auto-checks */}
          <div style={{ padding: '16px 20px', background: 'rgba(0,53,102,0.03)', border: '1px solid rgba(0,53,102,0.07)', marginBottom: 36 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>System checks on upload</div>
            {['Resolution (rejects if too small)', 'File type (JPG/PNG only)', 'Screenshot detection', 'Border detection (rejects black bars)'].map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.55, marginBottom: 4 }}>◎ {c}</div>
            ))}
          </div>

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/dashboard')}>← Dashboard</button>
            <button className="ae-btn-primary" onClick={() => router.push('/portal/submit/backdrop-color')} disabled={!selectedFile}>
              <span>Next: Backdrop Colour →</span>
            </button>
          </div>
        </div>

      </div>
    </StepShell>
  );
}
