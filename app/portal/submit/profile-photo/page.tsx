'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePortal } from '@/lib/portal-context';
import { supabase } from '@/lib/supabase';

export default function ProfilePhotoStep() {
  const router = useRouter();
  const { form, updateForm, saveStep, saving } = usePortal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(form.profilePhotoUrl);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!['image/jpeg', 'image/png', 'image/heic', 'image/heif'].includes(file.type)) {
      setError('Please upload a JPG, PNG, or HEIC file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    const img = new Image();
    img.onload = () => {
      if (img.width < 800 || img.height < 800) {
        setError(`Resolution too low. Minimum 800×800px. Your photo is ${img.width}×${img.height}px.`);
        setSelectedFile(null);
        setPreviewUrl(form.profilePhotoUrl);
      } else {
        setSelectedFile(file);
      }
    };
    img.src = URL.createObjectURL(file);
  };

  const handleNext = async () => {
    setUploading(true);
    try {
      let photoUrl = form.profilePhotoUrl;

      if (selectedFile) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError('Not logged in'); setUploading(false); return; }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('type', 'profile');

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        });

        if (res.ok) {
          const { url } = await res.json();
          photoUrl = url;
        } else {
          // If upload fails, continue without photo for now
          console.error('Upload failed, continuing without photo');
        }
      }

      updateForm({ profilePhotoUrl: photoUrl });
      await saveStep({ profile_photo_url: photoUrl });
      router.push('/portal/submit/backdrop-color');
    } finally {
      setUploading(false);
    }
  };

  const isLoading = saving || uploading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <header className="portal-header">
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span className="portal-logo">AerEthos</span>
          <span className="portal-logo-sub">Student Portal</span>
        </div>
        <a href="/portal/dashboard" className="ae-btn-secondary" style={{ fontSize: 10, textDecoration: 'none' }}>
          {isLoading ? 'Saving...' : 'Dashboard'}
        </a>
      </header>
      <div style={{ paddingTop: 64 }}>
        <div className="progress-strip">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-meta">
              <span className="progress-step-label">Step 1 of 6</span>
              <span className="progress-name">Profile Photo</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: '16.6%' }}/></div>
          </div>
        </div>
      </div>
      <div className="portal-content">
        <div className="ae-card fade-up">
          <div className="ae-eyebrow"><div className="ae-eyebrow-line"/><span className="ae-eyebrow-text">Step 01</span></div>
          <h1 className="ae-h1">Your yearbook<br/><em>profile photo.</em></h1>
          <p className="ae-lead">This is your main portrait. It will appear prominently on your yearbook page.</p>
          <div className="ae-notice warning" style={{ marginBottom: 32 }}>
            <div className="ae-notice-title">Photo Requirements</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#2f855a', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✓ Do</div>
                {['High-quality photo', 'Portrait orientation', 'Face clearly visible', 'Crop before uploading'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4 }}>· {t}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c53030', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>✕ Don&apos;t</div>
                {['Screenshots', 'Black bars/borders', 'Blurry images', 'Group shots'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: 'var(--blue)', opacity: 0.65, marginBottom: 4 }}>· {t}</div>
                ))}
              </div>
            </div>
          </div>
          <label htmlFor="photo-upload" className="ae-upload-zone" style={{ display: 'block', marginBottom: 20 }}>
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview" style={{ maxHeight: 280, margin: '0 auto', display: 'block', marginBottom: 16 }}/>
                <div style={{ fontSize: 11, color: 'var(--blue)', opacity: 0.45, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>Click to change photo</div>
              </div>
            ) : (
              <div>
                <div className="ae-upload-icon">◉</div>
                <div className="ae-upload-title">Drag & drop or click to upload</div>
                <div className="ae-upload-sub">JPG · PNG · HEIC · Max 10MB</div>
              </div>
            )}
          </label>
          <input id="photo-upload" type="file" accept="image/jpeg,image/png,image/heic,image/heif" onChange={handleFileSelect} style={{ display: 'none' }}/>
          {error && (
            <div className="ae-notice warning" style={{ marginBottom: 20 }}>
              <div className="ae-notice-title">Photo Rejected</div>
              <div className="ae-notice-body">{error}</div>
              <button onClick={() => setError(null)} style={{ marginTop: 10, fontSize: 11, color: '#c53030', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>Try Another →</button>
            </div>
          )}
          <div className="step-nav">
            <button className="ae-btn-secondary" onClick={() => router.push('/portal/dashboard')}>← Dashboard</button>
            <button className="ae-btn-primary" onClick={handleNext} disabled={(!selectedFile && !form.profilePhotoUrl) || isLoading}>
              <span>{isLoading ? 'Uploading...' : 'Next: Backdrop Colour →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
