'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/portal-context';
import { supabase } from '@/lib/supabase';

export default function MemoryPhotosStep() {
  const router = useRouter();
  const { form, updateForm, saveStep, saving } = usePortal();
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; file?: File }>>([
    ...(form.memoryPhotos ?? []),
  ]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleNext = async () => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        if (photo.file && session) {
          const formData = new FormData();
          formData.append('file', photo.file);
          formData.append('type', 'memory');
          const res = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: formData,
          });
          if (res.ok) {
            const { url } = await res.json();
            uploadedUrls.push(url);
          } else {
            uploadedUrls.push(photo.url);
          }
        } else {
          uploadedUrls.push(photo.url);
        }
      }

      updateForm({ memoryPhotos: photos });
      await saveStep({ memory_photo_urls: uploadedUrls });
      router.push('/portal/submit/quote');
    } finally {
      setUploading(false);
    }
  };

  const canProceed = photos.length >= 10;
  const isLoading = saving || uploading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>
          {isLoading ? 'Uploading...' : 'Dashboard'}
        </a>
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
          <p className="ae-lead">These photos form the collage at the bottom of your yearbook page. Upload your favourite moments.</p>
          <div className="ae-notice warning" style={{ marginBottom: 32 }}>
            <div className="ae-notice-title">Requirements</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f855a', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✓ Do</div>
                {['High-quality photos', 'Crop before uploading', 'Mix of moments'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4 }}>· {t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c53030', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕ Don&apos;t</div>
                {['Screenshots', 'Black borders', 'Blurry images'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4 }}>· {t}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 200, color: photos.length >= 10 ? '#2f855a' : 'var(--gold)', lineHeight: 1 }}>{photos.length}</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--blue)', opacity: 0.6 }}>photos uploaded</div>
              <div style={{ fontSize: 11, color: photos.length >= 10 ? '#2f855a' : 'var(--blue)', opacity: photos.length >= 10 ? 1 : 0.45, marginTop: 2 }}>
                {photos.length < 10 ? `${10 - photos.length} more needed` : photos.length < 25 ? `Up to ${25 - photos.length} more allowed` : 'Maximum reached'}
              </div>
            </div>
          </div>
          <div className={`ae-upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
            style={{ marginBottom: 24 }}>
            <div className="ae-upload-icon">◈</div>
            <div className="ae-upload-title">Drag & drop photos here</div>
            <div className="ae-upload-sub" style={{ marginBottom: 20 }}>or click to select multiple files</div>
            <label htmlFor="memory-upload" style={{ display: 'inline-block', padding: '12px 28px', background: 'var(--blue)', color: 'var(--cream)', fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer' }}>
              Select Photos
            </label>
            <input id="memory-upload" type="file" accept="image/jpeg,image/png" multiple onChange={e => addFiles(e.target.files)} style={{ display: 'none' }}/>
          </div>
          {photos.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--blue)', opacity: 0.4, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Uploaded Photos ({photos.length})</div>
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
          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/submit/backdrop-color')}>← Back</button>
            <button className="ae-btn-primary" onClick={handleNext} disabled={!canProceed || isLoading}>
              <span>{isLoading ? 'Uploading...' : 'Next: Your Quote →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
