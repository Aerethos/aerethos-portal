'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MemoryPhotosStep() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; file: File }>>([]);
  const [dragOver, setDragOver] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files).map(file => ({
      id: Math.random().toString(36).slice(2, 9),
      url: URL.createObjectURL(file),
      file,
    }));
    setPhotos(prev => [...prev, ...next].slice(0, 25));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const canProceed = photos.length >= 10;

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
              <span className="progress-step-label">Step 3 of 6</span>
              <span className="progress-name">Memory Photos</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '50%' }}/></div>
          </div>
        </div>
      </div>

      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 03</span></div>
          <h1 className="ae-h1">Your memory<br/><em>photo collage.</em></h1>
          <p className="ae-lead">These photos form the collage at the bottom of your yearbook page. Upload your favourite moments from the year.</p>

          {/* Requirements */}
          <div className="ae-notice warning" style={{ marginBottom: 32 }}>
            <div className="ae-notice-title">Critical Requirements</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f855a', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✓ Do upload</div>
                {['High-quality photos from your camera roll', 'Crop before uploading — no black bars', 'Mix of friends, trips, events, candid moments'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4, lineHeight: 1.45 }}>· {t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c53030', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕ Don&apos;t upload</div>
                {['Screenshots', 'Photos with black borders', 'Blurry or pixelated images'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4, lineHeight: 1.45 }}>· {t}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 48,
              fontWeight: 200,
              color: photos.length >= 10 ? '#2f855a' : 'var(--gold)',
              lineHeight: 1,
            }}>{photos.length}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.6 }}>photos uploaded</div>
              <div style={{ fontSize: 11, color: photos.length >= 10 ? '#2f855a' : 'var(--blue)', opacity: photos.length >= 10 ? 1 : 0.45, marginTop: 2 }}>
                {photos.length < 10
                  ? `${10 - photos.length} more needed to continue`
                  : photos.length < 25 ? `You can add up to ${25 - photos.length} more` : 'Maximum reached'}
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            className={`ae-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{ marginBottom: 24 }}
          >
            <div className="ae-upload-icon">◈</div>
            <div className="ae-upload-title">Drag & drop photos here</div>
            <div className="ae-upload-sub" style={{ marginBottom: 20 }}>or click to select multiple files</div>
            <label htmlFor="memory-upload" style={{
              display: 'inline-block',
              padding: '12px 28px',
              background: 'var(--blue)',
              color: 'var(--cream)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}>
              Select Photos
            </label>
            <input id="memory-upload" type="file" accept="image/jpeg,image/png" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }}/>
          </div>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Uploaded Photos ({photos.length})
              </div>
              <div className="photo-grid">
                {photos.map(p => (
                  <div key={p.id} className="photo-thumb">
                    <img src={p.url} alt="Memory"/>
                    <button className="photo-remove" onClick={() => setPhotos(prev => prev.filter(x => x.id !== p.id))}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ae-notice" style={{ marginBottom: 36 }}>
            <div className="ae-notice-body">Landscape and portrait photos both work well. AerEthos will arrange them automatically to create the best collage. Upload candid moments, group shots, trips and events that tell your story.</div>
          </div>

          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/backdrop-color')}>← Back</button>
            <button className="ae-btn-primary" onClick={() => router.push('/portal/submit/quote')} disabled={!canProceed}>
              <span>Next: Your Quote →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
